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
const api = require("api");
var StrategyStatusEnum;
(function (StrategyStatusEnum) {
    StrategyStatusEnum[StrategyStatusEnum["in_buy"] = 0] = "in_buy";
    StrategyStatusEnum[StrategyStatusEnum["in_sell"] = 1] = "in_sell";
    StrategyStatusEnum[StrategyStatusEnum["exited"] = 2] = "exited";
})(StrategyStatusEnum || (StrategyStatusEnum = {}));
class StrategyBacktestService {
    constructor() {
        // private client: redis.RedisClient = redis.createClient();
        this.snapshots = [];
        this.events = [];
        this.reports = [];
        this.strategyPayload = {};
    }
    backtest(strategyId, instrument) {
        return __awaiter(this, void 0, void 0, function* () {
            // this.client.on('connect', async () => {
            console.log('redis is ready!');
            const strategy = yield api.models.strategyModel.findById(strategyId);
            if (strategy === null) {
                throw new Error('strategy not found!');
            }
            let stillInLoop = true;
            let candleTime = new Date('1900-01-01');
            let numberOfEvents = 0;
            do {
                const events = yield this.getInstrumentEvents(instrument, candleTime, strategy.events.map((x) => x));
                numberOfEvents += events.length;
                for (const event of events) {
                    yield this.process(strategy, event);
                    candleTime = event.candleTime;
                }
                stillInLoop = events.length !== 0;
            } while (stillInLoop);
            this.produceReport(strategy, instrument);
            yield this.saveIntoDb(strategyId);
            return numberOfEvents;
            // });
        });
    }
    saveIntoDb(strategyId) {
        return __awaiter(this, void 0, void 0, function* () {
            // api.models.strategyBacktestSnapshotModel.create(this.snapshots);
            yield api.models.strategyBacktestEventModel.find({ strategyId }).remove().exec();
            yield api.models.strategyBacktestEventModel.create(this.events);
            yield api.models.strategyBacktestReportModel.find({ strategyId }).remove().exec();
            yield api.models.strategyBacktestReportModel.create(this.reports);
        });
    }
    publishEvents(tempBacktestTopicName) {
        return __awaiter(this, void 0, void 0, function* () {
            const producer = new api.proxies.StrategyBacktestProducerProxy(tempBacktestTopicName);
            producer.publish(this.events);
        });
    }
    produceReport(strategy, instrumnet) {
        let report;
        const totalPips = 0;
        for (const event of this.events) {
            if (event.event === StrategyStatusEnum[StrategyStatusEnum.in_buy] ||
                event.event === StrategyStatusEnum[StrategyStatusEnum.in_sell]) {
                report = {
                    strategyId: strategy.id,
                    instrument: instrumnet,
                    timeIn: event.time,
                    priceIn: event.event === StrategyStatusEnum[StrategyStatusEnum.in_buy]
                        ? event.payload.ask : event.payload.bid,
                    tradeType: event.event,
                };
                this.reports.push(report);
                // let reportModel = new api.models.strategyBacktestReportModel(report);
                // model = await reportModel.save();
            }
            else if (event.event === StrategyStatusEnum[StrategyStatusEnum.exited]) {
                if (report) {
                    report.timeOut = event.time;
                    report.priceOut = report.tradeType === StrategyStatusEnum[StrategyStatusEnum.in_buy] ?
                        event.payload.ask : event.payload.bid;
                    report.pips = report.tradeType === StrategyStatusEnum[StrategyStatusEnum.in_buy]
                        ? report.priceOut - report.priceIn
                        : report.priceIn - report.priceOut;
                    report.pips = Number((report.pips * 100000).toFixed(5));
                    // await model.save();
                }
            }
        }
    }
    getInstrumentEvents(instrument, candleTime, events) {
        return __awaiter(this, void 0, void 0, function* () {
            const proxy = new api.proxies.InstrumentProxy();
            const eventsString = events.join(',');
            const result = yield proxy.getEvents(api.enums.InstrumentEnum[instrument], candleTime, eventsString);
            return result.body;
        });
    }
    process(strategy, instrumentEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            const strategyProcess = new api.services.RaisingCandles();
            const result = yield strategyProcess.execute(this.strategyPayload, instrumentEvent, () => {
                if (this.strategyStatus !== StrategyStatusEnum.exited) {
                    const eventItem = {
                        event: StrategyStatusEnum[StrategyStatusEnum.exited],
                        isDispatched: false,
                        payload: Object.assign({}, this.strategyPayload, { bid: instrumentEvent.candleBid, ask: instrumentEvent.candleAsk }),
                        time: instrumentEvent.candleTime,
                        topic: 'test',
                        strategyId: strategy.id,
                    };
                    this.events.push(eventItem);
                    this.strategyStatus = StrategyStatusEnum.exited;
                }
            }, () => {
                if (this.strategyStatus !== StrategyStatusEnum.in_buy) {
                    const eventItem = {
                        event: StrategyStatusEnum[StrategyStatusEnum.in_buy],
                        isDispatched: false,
                        payload: Object.assign({}, this.strategyPayload, { bid: instrumentEvent.candleBid, ask: instrumentEvent.candleAsk }),
                        time: instrumentEvent.candleTime,
                        topic: 'test',
                        strategyId: strategy.id,
                    };
                    this.events.push(eventItem);
                    this.strategyStatus = StrategyStatusEnum.in_buy;
                }
            }, () => {
                if (this.strategyStatus !== StrategyStatusEnum.in_sell) {
                    const eventItem = {
                        event: StrategyStatusEnum[StrategyStatusEnum.in_sell],
                        isDispatched: false,
                        payload: Object.assign({}, this.strategyPayload, { bid: instrumentEvent.candleBid, ask: instrumentEvent.candleAsk }),
                        time: instrumentEvent.candleTime,
                        strategyId: strategy.id,
                        topic: 'test',
                    };
                    this.events.push(eventItem);
                    this.strategyStatus = StrategyStatusEnum.in_sell;
                }
            });
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
exports.StrategyBacktestService = StrategyBacktestService;
//# sourceMappingURL=strategy-backtest.service.js.map