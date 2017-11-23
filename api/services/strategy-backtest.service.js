"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
let asyncLock = require('async-lock');
const api = require("../../api");
class StrategyBacktestService {
    backtest(strategy, instrument) {
        return __awaiter(this, void 0, void 0, function* () {
            // delete the snapshot
            let tempBacktestTopicName = yield this.generateTempTopicForBacktest(strategy.id, instrument);
            let tempCandlesTopicName = yield this.generateTempTopicForCandles(instrument, api.enums.GranularityEnum[strategy.granularity]);
            let candleConsumer = new api.proxies.CandleConsumerProxy(tempCandlesTopicName);
            // should await otherwise it gets the topic does not exist from this service
            yield this.callInstrumentServiceToFetchCandles(instrument, strategy, tempCandlesTopicName);
            this.subscribeToCandlesTopicToBacktest(candleConsumer, strategy, instrument, tempBacktestTopicName);
            this.subscribeToBacktestTopicToHandleEvents(strategy, instrument, tempBacktestTopicName);
        });
    }
    subscribeToCandlesTopicToBacktest(candleConsumer, strategy, instrument, tempBacktestTopicName) {
        let lock = new asyncLock();
        let key, opts = null;
        candleConsumer.subscribe().subscribe(candle => {
            lock.acquire(key, () => __awaiter(this, void 0, void 0, function* () {
                yield this.process(strategy, instrument, candle, tempBacktestTopicName);
                return;
            }), opts).then(function () {
                console.log('lock released');
            }).catch(function (err) {
                console.error(err.message);
            });
        }, error => { console.error(error); });
    }
    subscribeToBacktestTopicToHandleEvents(strategy, instrumnet, tempBacktestTopicName) {
        let strategyBacktestConsumer = new api.proxies.StrategyBacktestConsumerProxy(tempBacktestTopicName);
        let model;
        let totalPips = 0;
        strategyBacktestConsumer.subscribe().subscribe((event) => __awaiter(this, void 0, void 0, function* () {
            if (event.event === "long" || event.event === "short") {
                let report = new api.models.strategyBacktestReportModel({
                    strategyId: strategy.id,
                    instrument: instrumnet,
                    topic: tempBacktestTopicName,
                    timeIn: event.time,
                    candleIn: event.payload.close,
                    tradeType: event.event,
                });
                model = yield report.save();
            }
            else if (event.event === "out") {
                if (model) {
                    model.timeOut = event.time;
                    model.candleOut = event.payload.close;
                    model.pips = model.tradeType === 'long' ? model.candleOut - model.candleIn : model.candleIn - model.candleOut;
                    model.pips = model.pips * 100000;
                    yield model.save();
                }
            }
        }), error => { console.error(error); });
    }
    callInstrumentServiceToFetchCandles(instrument, strategy, tempCandlesTopicName) {
        return __awaiter(this, void 0, void 0, function* () {
            let proxy = new api.proxies.InstrumentProxy();
            let count = yield proxy.getCandles(api.enums.InstrumentEnum[instrument], strategy.granularity, tempCandlesTopicName);
        });
    }
    process(strategy, instrument, candle, topicName) {
        return __awaiter(this, void 0, void 0, function* () {
            // get snapshot of strategy-backtest event from db
            let snapshot = yield api.models.strategyBacktestSnapshotModel.findLastBacktestSnapshot(topicName);
            let eventHandler = new api.services.RaisingCandles();
            let time = snapshot ? snapshot.time : 0;
            // if snapshot, then replay channel from snapshot's offset and resolve the last status
            // progress based on the last status and current candle and get the current status
            // insert the current status (snapshot) if needed into db -- needed means current status is out (maybe)
            // push the current status into channel -- finish
            let events = yield api.models.strategyBacktestEventModel.findBacktestEventsToReplay(topicName, time);
            let newSnapshot = eventHandler.replay(snapshot, events);
            if (newSnapshot) {
                let snapshotDocument = new api.models.strategyBacktestSnapshotModel({
                    topic: topicName,
                    time: newSnapshot.time,
                    payload: newSnapshot.payload,
                });
                yield snapshotDocument.save();
            }
            let result = yield eventHandler.processCandle(candle);
            let eventDocument = new api.models.strategyBacktestEventModel({
                topic: topicName,
                time: Number(candle.time),
                isDispatched: false,
                event: result.event,
                payload: result.payload,
            });
            yield eventDocument.save();
            let producer = new api.proxies.StrategyBacktestProducerProxy(topicName);
            yield producer.publish();
        });
    }
    generateTempTopicForBacktest(strategyId, instrument) {
        return __awaiter(this, void 0, void 0, function* () {
            let topic = `temp_${strategyId}_${Date.now()}`;
            yield new api.proxies.StrategyBacktestConsumerProxy(topic).createTopic();
            return topic;
        });
    }
    generateTempTopicForCandles(instrument, granularity) {
        return __awaiter(this, void 0, void 0, function* () {
            const audUsdM5Topic = `temp_audUsdM5_${Date.now()}`;
            switch (instrument) {
                case api.enums.InstrumentEnum.AUD_USD:
                    switch (granularity) {
                        case api.enums.GranularityEnum.M5:
                            yield new api.proxies.CandleConsumerProxy(audUsdM5Topic).createTopic();
                            return audUsdM5Topic;
                    }
                    break;
            }
            throw new Error('cannot find the topic name!');
        });
    }
}
exports.StrategyBacktestService = StrategyBacktestService;
//# sourceMappingURL=strategy-backtest.service.js.map