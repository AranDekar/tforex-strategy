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
const asyncLock = require("async-lock");
const redis = require("redis");
const api = require("api");
class StrategyBacktestServiceOLD {
    constructor() {
        this.client = redis.createClient();
        this.snapshots = [];
        this.events = [];
        this.reports = [];
    }
    backtest(strategy, instrument) {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.on('connect', () => __awaiter(this, void 0, void 0, function* () {
                console.log('redis is ready!');
                // delete the snapshot
                const tempBacktestTopicName = yield this.generateTempTopicForBacktest(strategy.id, instrument);
                const tempCandlesTopicName = yield this.generateTempTopicForCandles(instrument, api.enums.GranularityEnum[strategy.granularity]);
                const candleConsumer = new api.proxies.CandleConsumerProxy(tempCandlesTopicName);
                // should await otherwise it gets the topic does not exist from this service
                const count = yield this.callInstrumentServiceToFetchCandles(instrument, strategy, tempCandlesTopicName);
                yield this.subscribeToCandlesTopicToBacktest(candleConsumer, strategy, instrument, tempBacktestTopicName, count.body.count);
                this.publishEvents(tempBacktestTopicName);
                yield this.subscribeToBacktestTopicToHandleEvents(strategy, instrument, tempBacktestTopicName, count.body.count);
                yield this.saveIntoDb();
            }));
        });
    }
    saveIntoDb() {
        return __awaiter(this, void 0, void 0, function* () {
            api.models.strategyBacktestSnapshotModel.create(this.snapshots);
            api.models.strategyBacktestEventModel.create(this.events);
            api.models.strategyBacktestReportModel.create(this.reports);
        });
    }
    publishEvents(tempBacktestTopicName) {
        return __awaiter(this, void 0, void 0, function* () {
            const producer = new api.proxies.StrategyBacktestProducerProxy(tempBacktestTopicName);
            producer.publish(this.events);
        });
    }
    subscribeToCandlesTopicToBacktest(candleConsumer, strategy, instrument, tempBacktestTopicName, count) {
        return new Promise((resolve, reject) => {
            const lock = new asyncLock({ maxPending: count });
            // tslint:disable-next-line:typedef
            const key = null;
            // tslint:disable-next-line:typedef
            const opts = null;
            let localCounter = 0;
            candleConsumer.subscribe(count).subscribe((candles) => {
                for (const candle of candles) {
                    lock.acquire(key, () => __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield this.process(strategy, instrument, candle, tempBacktestTopicName);
                            localCounter = localCounter + 1;
                            return;
                        }
                        catch (err) {
                            console.error(err);
                            reject(err);
                        }
                    }), opts).then(() => {
                        console.log('lock released');
                        if (localCounter >= count) {
                            resolve(true);
                        }
                    }).catch((err) => {
                        console.error(err.message);
                        reject(err);
                    });
                }
            }, (error) => {
                console.error(error);
                reject(error);
            });
        });
    }
    subscribeToBacktestTopicToHandleEvents(strategy, instrumnet, tempBacktestTopicName, count) {
        const strategyBacktestConsumer = new api.proxies.StrategyBacktestConsumerProxy(tempBacktestTopicName);
        // let model;
        let report;
        const totalPips = 0;
        return new Promise((resolve, reject) => {
            strategyBacktestConsumer.subscribe(count).subscribe((events) => __awaiter(this, void 0, void 0, function* () {
                for (const event of events) {
                    if (event.event === 'long' || event.event === 'short') {
                        report = {
                            strategyId: strategy.id,
                            instrument: instrumnet,
                            topic: tempBacktestTopicName,
                            timeIn: event.time,
                            candleIn: event.payload.close,
                            tradeType: event.event,
                        };
                        this.reports.push(report);
                        // let reportModel = new api.models.strategyBacktestReportModel(report);
                        // model = await reportModel.save();
                    }
                    else if (event.event === 'out') {
                        if (report) {
                            report.timeOut = event.time;
                            report.candleOut = event.payload.close;
                            report.pips = report.tradeType === 'long'
                                ? report.candleOut - report.candleIn
                                : report.candleIn - report.candleOut;
                            report.pips = report.pips * 100000;
                            // await model.save();
                        }
                    }
                }
                resolve(true);
            }), (error) => {
                console.error(error);
                reject(error);
            });
        });
    }
    callInstrumentServiceToFetchCandles(instrument, strategy, tempCandlesTopicName) {
        return __awaiter(this, void 0, void 0, function* () {
            const proxy = new api.proxies.InstrumentProxy();
            // return await proxy.getCandles(api.enums.InstrumentEnum[instrument], strategy.granularity,
            //  tempCandlesTopicName);
            return { body: { count: 10 } };
        });
    }
    process(strategy, instrument, candle, topicName) {
        return __awaiter(this, void 0, void 0, function* () {
            // get snapshot of strategy-backtest event from db
            // let snapshot = await api.models.strategyBacktestSnapshotModel.findLastBacktestSnapshot(topicName);
            const snapshot = this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
            const eventHandler = new api.services.RaisingCandles();
            const time = snapshot ? snapshot.time : new Date(1900, 1, 1);
            // if snapshot, then replay channel from snapshot's offset and resolve the last status
            // progress based on the last status and current candle and get the current status
            // insert the current status (snapshot) if needed into db -- needed means current status is out (maybe)
            // push the current status into channel -- finish
            // let events = await api.models.strategyBacktestEventModel.findBacktestEventsToReplay(topicName, time);
            const events = this.events.filter((x) => x.time > time);
            const newSnapshot = eventHandler.replay(snapshot, events);
            if (newSnapshot) {
                const snapshotToSave = {
                    topic: topicName,
                    time: newSnapshot.time,
                    payload: newSnapshot.payload,
                };
                this.snapshots.push(snapshotToSave);
                // let snapshotDocument = new api.models.strategyBacktestSnapshotModel(snapshot);
                // await snapshotDocument.save();
            }
            const result = yield eventHandler.processCandle(candle);
            const event = {
                topic: topicName,
                time: candle.time,
                isDispatched: false,
                event: result.event,
                payload: result.payload,
            };
            this.events.push(event);
            // let eventDocument = new api.models.strategyBacktestEventModel(event);
            // await eventDocument.save();
        });
    }
    generateTempTopicForBacktest(strategyId, instrument) {
        return __awaiter(this, void 0, void 0, function* () {
            const topic = `temp_${strategyId}_${Date.now()}`;
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
exports.StrategyBacktestServiceOLD = StrategyBacktestServiceOLD;
//# sourceMappingURL=strategy-backtest.service-OLD.js.map