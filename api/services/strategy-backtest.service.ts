import * as asyncLock from 'async-lock';
import * as redis from 'redis';

import * as api from 'api';
import { InstrumentEvent } from '../interfaces';
import { InstrumentEventEnum } from '../enums';

enum StrategyStatusEnum {
    in_buy,
    in_sell,
    exited,
}
export class StrategyBacktestService {
    // private client: redis.RedisClient = redis.createClient();
    private snapshots: api.models.StrategySnapshot[] = [];
    private events: api.models.StrategyEvent[] = [];
    private reports: api.models.StrategyBcktestReport[] = [];
    private strategyPayload: any = {};
    private strategyStatus: StrategyStatusEnum;

    public async backtest(strategyId: string, instrument: api.enums.InstrumentEnum): Promise<number> {
        // this.client.on('connect', async () => {
        console.log('redis is ready!');
        const strategy = await api.models.strategyModel.findById(strategyId);
        if (strategy === null) {
            throw new Error('strategy not found!');
        }
        let stillInLoop = true;
        let candleTime: Date = new Date('1900-01-01');
        let numberOfEvents = 0;
        do {

            const events = await this.getInstrumentEvents(instrument, candleTime, strategy.events.map((x) => x));
            numberOfEvents += events.length;
            for (const event of events) {
                await this.process(strategy, event);
                candleTime = event.candleTime;
            }
            stillInLoop = events.length !== 0;
        } while (stillInLoop);
        this.produceReport(strategy, instrument);

        await this.saveIntoDb();
        return numberOfEvents;
        // });
    }

    private async saveIntoDb() {
        api.models.strategyBacktestSnapshotModel.create(this.snapshots);
        api.models.strategyBacktestEventModel.create(this.events);
        api.models.strategyBacktestReportModel.create(this.reports);
    }

    private async publishEvents(tempBacktestTopicName: string): Promise<void> {
        const producer = new api.proxies.StrategyBacktestProducerProxy(tempBacktestTopicName);
        producer.publish(this.events);
    }

    private produceReport(
        strategy: api.models.StrategyDocument,
        instrumnet: api.enums.InstrumentEnum) {

        let report;
        const totalPips = 0;
        for (const event of this.events) {
            if (event.event === StrategyStatusEnum[StrategyStatusEnum.in_buy] ||
                event.event === StrategyStatusEnum[StrategyStatusEnum.in_sell]) {

                report = {
                    strategyId: strategy.id,
                    instrument: instrumnet,
                    timeIn: event.time,
                    candleIn: event.payload.close,
                    tradeType: event.event,
                };
                this.reports.push(report);
                // let reportModel = new api.models.strategyBacktestReportModel(report);
                // model = await reportModel.save();
            } else if (event.event === StrategyStatusEnum[StrategyStatusEnum.exited]) {
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
    }

    private async getInstrumentEvents(
        instrument: api.enums.InstrumentEnum,
        candleTime: Date,
        events: InstrumentEventEnum[]) {
        const proxy = new api.proxies.InstrumentProxy();
        const eventsString = events.join(',');
        const result = await proxy.getEvents(api.enums.InstrumentEnum[instrument], candleTime, eventsString);
        return result.body;
    }

    private async process(strategy: api.models.StrategyDocument, instrumentEvent: InstrumentEvent) {

        const strategyProcess = new api.services.RaisingCandles();

        const result = await strategyProcess.execute(this.strategyPayload, instrumentEvent,
            () => { // exit
                if (this.strategyStatus !== StrategyStatusEnum.exited) {
                    const eventItem: api.models.StrategyEvent = {
                        event: StrategyStatusEnum[StrategyStatusEnum.exited],
                        isDispatched: false,
                        payload: {
                            ...this.strategyPayload,
                            bid: instrumentEvent.candleBid,
                            ask: instrumentEvent.candleAsk,
                        },
                        time: new Date(),
                        topic: 'test',
                    };
                    this.events.push(eventItem);
                    this.strategyStatus = StrategyStatusEnum.exited;
                }
            },
            () => { // buy
                if (this.strategyStatus !== StrategyStatusEnum.in_buy) {
                    const eventItem: api.models.StrategyEvent = {
                        event: StrategyStatusEnum[StrategyStatusEnum.in_buy],
                        isDispatched: false,
                        payload: {
                            ...this.strategyPayload,
                            bid: instrumentEvent.candleBid,
                            ask: instrumentEvent.candleAsk,
                        },
                        time: new Date(),
                        topic: 'test',
                    };
                    this.events.push(eventItem);
                    this.strategyStatus = StrategyStatusEnum.in_buy;
                }
            },
            () => { // sell
                if (this.strategyStatus !== StrategyStatusEnum.in_sell) {
                    const eventItem: api.models.StrategyEvent = {
                        event: StrategyStatusEnum[StrategyStatusEnum.in_sell],
                        isDispatched: false,
                        payload: {
                            ...this.strategyPayload,
                            bid: instrumentEvent.candleBid,
                            ask: instrumentEvent.candleAsk,
                        },
                        time: new Date(),
                        topic: 'test',
                    };
                    this.events.push(eventItem);
                    this.strategyStatus = StrategyStatusEnum.in_sell;
                }
            },
        );

        // let eventDocument = new api.models.strategyBacktestEventModel(event);
        // await eventDocument.save();
    }

    private async generateTempTopicForBacktest(strategyId, instrument) {
        const topic = `temp_${strategyId}_${Date.now()}`;
        await new api.proxies.StrategyBacktestConsumerProxy(topic).createTopic();
        return topic;
    }

    private async generateTempTopicForCandles(
        instrument: api.enums.InstrumentEnum,
        granularity: api.enums.GranularityEnum) {

        const audUsdM5Topic = `temp_audUsdM5_${Date.now()}`;
        switch (instrument) {
            case api.enums.InstrumentEnum.AUD_USD:
                switch (granularity) {
                    case api.enums.GranularityEnum.M5:
                        await new api.proxies.CandleConsumerProxy(audUsdM5Topic).createTopic();
                        return audUsdM5Topic;
                }
                break;
        }
        throw new Error('cannot find the topic name!');
    }
}
