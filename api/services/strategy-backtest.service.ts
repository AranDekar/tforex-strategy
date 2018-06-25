// import * as requireFromString from 'require-from-string';

import * as api from 'api';
import { InstrumentEvent } from '../interfaces';
import { InstrumentEventEnum } from '../enums';
import { QuarterlyReport, MonthlyReport, StrategyReportSummary, HalfYearlyReport } from 'api/models';
import { ObjectId } from 'mongodb';

enum StrategyStatusEnum {
    in_buy,
    in_sell,
    exited,
}

export class StrategyBacktestService {

    // private client: redis.RedisClient = redis.createClient();
    private snapshots: api.models.StrategySnapshot[] = [];
    private events: api.models.StrategyEvent[] = [];
    private reports: api.models.StrategyReport[] = [];
    private annualReps: StrategyReportSummary[] = [];
    private strategyPayload: any = {};
    private strategyStatus: StrategyStatusEnum | undefined;

    public async backtest(strategyRevisionId: string): Promise<number> {
        // this.client.on('connect', async () => {
        const strategyRevision = await api.models.strategyRevisionModel
            .findById(strategyRevisionId)
            .populate('strategy')
            .exec();
        if (strategyRevision === null) {
            throw new Error('strategyRevision not found!');
        }
        let numberOfEvents = 0;
        let strategyProcess: api.services.StrategyProcess;

        try {
            strategyProcess = await import(strategyRevision.code);
            if (!strategyProcess) {
                throw new Error('code of the revision cannot be executed!');
            }
        } catch (err) {
            throw new Error(`code of the revision cannot be executed! ${err.message}`);
        }

        for (const item in api.enums.InstrumentEnum) {
            if (isNaN(Number(item))) {
                const instrument = api.enums.InstrumentEnum[item];
                const ins = api.enums.InstrumentEnum[instrument];
                if (instrument) {
                    this.snapshots = [];
                    this.events = [];
                    this.reports = [];
                    this.strategyPayload = {};
                    this.strategyStatus = undefined;
                    await this.clearOutDb(strategyRevisionId, ins);

                    let stillInLoop = true;
                    let candleTime: Date = new Date('1900-01-01');
                    do {
                        const events = await this.getInstrumentEvents(ins,
                            candleTime,
                            strategyRevision.strategy.events.map((x) => x));
                        numberOfEvents += events.length;
                        for (const event of events) {
                            await this.process(
                                strategyProcess,
                                ins,
                                strategyRevision, event);
                            candleTime = event.candleTime;
                        }
                        stillInLoop = events.length !== 0;
                    } while (stillInLoop);
                    this.produceReport(strategyRevision, ins);
                    this.produceReportSummary(strategyRevision, ins);
                    await this.saveIntoDb();
                }
            }
        }
        return numberOfEvents;
    }

    private async clearOutDb(revision: string, instr: api.enums.InstrumentEnum) {
        await api.models.strategyEventModel.deleteMany({ strategyRevision: revision, instrument: instr }).exec();
        await api.models.strategyReportModel.deleteMany({ strategyRevision: revision, instrument: instr }).exec();
        await api.models.strategyReportSummaryModel.deleteMany({
            strategyRevision: new ObjectId(revision),
            instrument: instr,
        }).exec();
    }

    private async saveIntoDb() {
        // api.models.strategyBacktestSnapshotModel.create(this.snapshots);
        await api.models.strategyEventModel.insertMany(this.events);
        await api.models.strategyReportModel.insertMany(this.reports);
        await api.models.strategyReportSummaryModel.insertMany(this.annualReps);
    }

    private async publishEvents(tempBacktestTopicName: string): Promise<void> {
        const producer = new api.proxies.StrategyBacktestProducerProxy(tempBacktestTopicName);
        producer.publish(this.events);
    }

    private produceReportSummary(
        strategyRevision: api.models.StrategyRevisionDocument,
        instrumnet: api.enums.InstrumentEnum) {

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const activeReports = this.reports.filter((a) => a.timeOut !== undefined && a.timeOut !== null);
        const minYear = activeReports[0].timeOut!.getFullYear();
        const minMonth = activeReports[0].timeOut!.getMonth();

        for (let m = minYear; m <= new Date().getFullYear(); m++) {
            let annualTotal, annualMaxProfit, annualMaxLoss;
            annualTotal = annualMaxProfit = annualMaxLoss = 0;
            const monthlyReps: MonthlyReport[] = [];
            // calculating monthly reports for the current year in the loop
            for (let n = 0; n <= 11; n++) {
                const reports = activeReports.filter((r) =>
                    r.timeOut!.getFullYear() === m &&
                    r.timeOut!.getMonth() === n)
                    .map((a) => a.pips);

                if (reports.length === 0) { continue; }
                reports.sort((a, b) => a - b);
                const total = reports.reduce((a, b) => a + b);
                const maxProfit = reports[reports.length - 1];
                const maxLoss = reports[0];

                annualTotal += total;
                annualMaxLoss = maxLoss < annualMaxLoss ? maxLoss : annualMaxLoss;
                annualMaxProfit = maxProfit > annualMaxProfit ? maxProfit : annualMaxProfit;

                monthlyReps.push({ month: monthNames[n], total, maxProfit, maxLoss });
            }

            // calculating quarterly reports based on calculated monthly reports
            const q1Months = monthlyReps.filter((a) => ['Jan', 'Feb', 'Mar'].indexOf(a.month) > -1);

            const q1: QuarterlyReport = {
                maxLoss: q1Months.length > 0 ? q1Months.map((a) => a.maxLoss).sort((a, b) => a - b)[0] : 0,
                maxProfit: q1Months.length > 0 ? q1Months.map((b) => b.maxProfit).
                    sort((a, b) => a - b)[q1Months.length - 1] : 0,
                quarter: 'q1',
                total: q1Months.length > 0 ? q1Months.map((c) => c.total).reduce((a, b) => a + b) : 0,
            };
            const q2Months = monthlyReps.filter((a) => ['Apr', 'May', 'Jun'].indexOf(a.month) > -1);
            const q2: QuarterlyReport = {
                maxLoss: q2Months.length > 0 ? q2Months.map((a) => a.maxLoss).sort((a, b) => a - b)[0] : 0,
                maxProfit: q2Months.length > 0 ? q2Months.map((b) => b.maxProfit).
                    sort((a, b) => a - b)[q2Months.length - 1] : 0,
                quarter: 'q2',
                total: q2Months.length > 0 ? q2Months.map((c) => c.total).reduce((a, b) => a + b) : 0,
            };
            const q3Months = monthlyReps.filter((a) => ['Jul', 'Aug', 'Sep'].indexOf(a.month) > -1);
            const q3: QuarterlyReport = {
                maxLoss: q3Months.length > 0 ? q3Months.map((a) => a.maxLoss).sort((a, b) => a - b)[0] : 0,
                maxProfit: q3Months.length > 0 ? q3Months.map((b) => b.maxProfit).
                    sort((a, b) => a - b)[q3Months.length - 1] : 0,
                quarter: 'q3',
                total: q3Months.length > 0 ? q3Months.map((c) => c.total).reduce((a, b) => a + b) : 0,
            };
            const q4Months = monthlyReps.filter((a) => ['Oct', 'Nov', 'Dec'].indexOf(a.month) > -1);
            const q4: QuarterlyReport = {
                maxLoss: q4Months.length > 0 ? q4Months.map((a) => a.maxLoss).sort((a, b) => a - b)[0] : 0,
                maxProfit: q4Months.length > 0 ? q4Months.map((b) => b.maxProfit).
                    sort((a, b) => a - b)[q4Months.length - 1] : 0,
                quarter: 'q4',
                total: q4Months.length > 0 ? q4Months.map((c) => c.total).reduce((a, b) => a + b) : 0,
            };

            // calculating half-yearly reports based on calculated monthly reports
            const hy1Months = monthlyReps.filter((a) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
                .indexOf(a.month) > -1);
            const hy1: HalfYearlyReport = {
                maxLoss: hy1Months.length > 0 ? hy1Months.map((a) => a.maxLoss).sort((a, b) => a - b)[0] : 0,
                maxProfit: hy1Months.length > 0 ? hy1Months.map((b) => b.maxProfit).
                    sort((a, b) => a - b)[hy1Months.length - 1] : 0,
                halfYear: 'half-year 1',
                total: hy1Months.length > 0 ? hy1Months.map((c) => c.total).reduce((a, b) => a + b) : 0,
            };
            const hy2Months = monthlyReps.filter((a) => ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                .indexOf(a.month) > -1);
            const hy2: HalfYearlyReport = {
                maxLoss: hy2Months.length > 0 ? hy2Months.map((a) => a.maxLoss).sort((a, b) => a - b)[0] : 0,
                maxProfit: hy2Months.length > 0 ? hy2Months.map((b) => b.maxProfit).
                    sort((a, b) => a - b)[hy2Months.length - 1] : 0,
                halfYear: 'half-year 2',
                total: hy2Months.length > 0 ? hy2Months.map((c) => c.total).reduce((a, b) => a + b) : 0,
            };

            this.annualReps.push({
                strategyRevision: strategyRevision.id, instrument: instrumnet,
                year: m, total: annualTotal, maxProfit: annualMaxProfit, maxLoss: annualMaxLoss,
                monthly: monthlyReps, quarterly: [q1, q2, q3, q4], halfYearly: [hy1, hy2],
            });
        }
    }

    private produceReport(
        strategyRevision: api.models.StrategyRevisionDocument,
        instrumnet: api.enums.InstrumentEnum) {

        let report: api.models.StrategyReport | undefined;
        const totalPips = 0;
        for (const event of this.events) {
            if (event.event === StrategyStatusEnum[StrategyStatusEnum.in_buy] ||
                event.event === StrategyStatusEnum[StrategyStatusEnum.in_sell]) {

                report = {
                    strategyRevision: strategyRevision.id,
                    instrument: instrumnet,
                    timeIn: new Date(event.candleTime),
                    payload: event.payload,
                    priceIn: event.event === StrategyStatusEnum[StrategyStatusEnum.in_buy]
                        ? event.payload.ask : event.payload.bid,
                    tradeType: event.event,
                    pips: 0,
                    priceOut: undefined,
                    timeOut: undefined,
                };
                this.reports.push(report);
                // let reportModel = new api.models.strategyBacktestReportModel(report);
                // model = await reportModel.save();
            } else if (event.event === StrategyStatusEnum[StrategyStatusEnum.exited]) {
                if (report) {
                    report.timeOut = new Date(event.candleTime);
                    report.priceOut = report.tradeType === StrategyStatusEnum[StrategyStatusEnum.in_buy]
                        ? event.payload.bid : event.payload.ask;
                    if (report.priceOut) {
                        report.pips = report.tradeType === StrategyStatusEnum[StrategyStatusEnum.in_buy]
                            ? report.priceOut - report.priceIn
                            : report.priceIn - report.priceOut;
                        report.pips = Number((report.pips * 100000).toFixed(5));
                    }

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

    private async process(
        strategyProcessFunc: api.services.StrategyProcess,
        instrument: api.enums.InstrumentEnum,
        strategyRevision: api.models.StrategyRevisionDocument,
        instrumentEvent: InstrumentEvent) {
        try {
            const result = strategyProcessFunc.execute(this.strategyPayload, instrumentEvent,
                () => this.runExitCommand(instrument, instrumentEvent, strategyRevision),
                () => this.runBuyCommand(instrument, instrumentEvent, strategyRevision),
                () => this.runSellCommand(instrument, instrumentEvent, strategyRevision),
            );
        } catch (error) {
            console.log(error);
        }

        // let eventDocument = new api.models.strategyBacktestEventModel(event);
        // await eventDocument.save();
    }

    private runSellCommand(
        instrument: api.enums.InstrumentEnum,
        instrumentEvent: api.interfaces.InstrumentEvent,
        strategyRevision: api.models.StrategyRevisionDocument) {
        if (this.strategyStatus !== StrategyStatusEnum.in_sell) {
            this.runExitCommand(instrument, instrumentEvent, strategyRevision);
            const eventItem: api.models.StrategyEvent = {
                event: StrategyStatusEnum[StrategyStatusEnum.in_sell],
                isDispatched: false,
                instrument,
                payload: {
                    ...this.strategyPayload,
                    bid: instrumentEvent.bidPrice,
                    ask: instrumentEvent.askPrice,
                },
                candleTime: instrumentEvent.candleTime,
                time: new Date(),
                strategyRevision: strategyRevision.id,
            };
            this.events.push(eventItem);
            this.strategyStatus = StrategyStatusEnum.in_sell;
        }
    }

    private runBuyCommand(
        instrument: api.enums.InstrumentEnum,
        instrumentEvent: api.interfaces.InstrumentEvent,
        strategyRevision: api.models.StrategyRevisionDocument) {
        if (this.strategyStatus !== StrategyStatusEnum.in_buy) {
            this.runExitCommand(instrument, instrumentEvent, strategyRevision);
            const eventItem: api.models.StrategyEvent = {
                event: StrategyStatusEnum[StrategyStatusEnum.in_buy],
                instrument,
                isDispatched: false,
                payload: {
                    ...this.strategyPayload,
                    bid: instrumentEvent.bidPrice,
                    ask: instrumentEvent.askPrice,
                },
                candleTime: instrumentEvent.candleTime,
                time: new Date(),
                strategyRevision: strategyRevision.id,
            };
            this.events.push(eventItem);
            this.strategyStatus = StrategyStatusEnum.in_buy;
        }
    }

    private runExitCommand(
        instrument: api.enums.InstrumentEnum,
        instrumentEvent: api.interfaces.InstrumentEvent,
        strategyRevision: api.models.StrategyRevisionDocument) {
        if (this.strategyStatus !== StrategyStatusEnum.exited) {
            const eventItem: api.models.StrategyEvent = {
                event: StrategyStatusEnum[StrategyStatusEnum.exited],
                instrument,
                isDispatched: false,
                payload: {
                    ...this.strategyPayload,
                    bid: instrumentEvent.bidPrice,
                    ask: instrumentEvent.askPrice,
                },
                candleTime: instrumentEvent.candleTime,
                time: new Date(),
                strategyRevision: strategyRevision.id,
            };
            this.events.push(eventItem);
            this.strategyStatus = StrategyStatusEnum.exited;
        }
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
