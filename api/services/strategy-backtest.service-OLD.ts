// import * as asyncLock from 'async-lock';
// import * as redis from 'redis';

// import * as api from 'api';

// export class StrategyBacktestServiceOLD {
//     private client: redis.RedisClient = redis.createClient();
//     private snapshots: api.models.StrategySnapshot[] = [];
//     private events: api.models.StrategyEvent[] = [];
//     private reports: api.models.StrategyBcktestReport[] = [];

//     public async backtest(strategy: api.models.StrategyDocument, instrument: api.enums.InstrumentEnum):
// Promise<void> {
//         this.client.on('connect', async () => {
//             console.log('redis is ready!');

//             // delete the snapshot
//             const tempBacktestTopicName: string = await this.generateTempTopicForBacktest(strategy.id, instrument);
//             const tempCandlesTopicName: string = await this.generateTempTopicForCandles(
//                 instrument,
//                 api.enums.GranularityEnum[strategy.granularity]);
//             const candleConsumer = new api.proxies.CandleConsumerProxy(tempCandlesTopicName);

//             // should await otherwise it gets the topic does not exist from this service
//             const count: { body: { count: number } } = await this.callInstrumentServiceToFetchCandles(
//                 instrument, strategy, tempCandlesTopicName);

//             await this.subscribeToCandlesTopicToBacktest(candleConsumer, strategy,
//                 instrument, tempBacktestTopicName, count.body.count);

//             this.publishEvents(tempBacktestTopicName);

//             await this.subscribeToBacktestTopicToHandleEvents(
//                 strategy, instrument, tempBacktestTopicName, count.body.count);

//             await this.saveIntoDb();

//         });
//     }

//     private async saveIntoDb() {
//         api.models.strategyBacktestSnapshotModel.create(this.snapshots);
//         api.models.strategyBacktestEventModel.create(this.events);
//         api.models.strategyBacktestReportModel.create(this.reports);
//     }

//     private async publishEvents(tempBacktestTopicName: string): Promise<void> {
//         const producer = new api.proxies.StrategyBacktestProducerProxy(tempBacktestTopicName);
//         producer.publish(this.events);
//     }

//     private subscribeToCandlesTopicToBacktest(
//         candleConsumer: api.proxies.CandleConsumerProxy,
//         strategy: api.models.StrategyDocument,
//         instrument: api.enums.InstrumentEnum, tempBacktestTopicName: string, count: number): Promise<{}> {
//         return new Promise((resolve, reject) => {
//             const lock: asyncLock = new asyncLock({ maxPending: count });
//             // tslint:disable-next-line:typedef
//             const key = null;
//             // tslint:disable-next-line:typedef
//             const opts = null;
//             let localCounter: number = 0;
//             candleConsumer.subscribe(count).subscribe((candles: api.interfaces.Candle[]) => {
//                 for (const candle of candles) {
//                     lock.acquire(key, async () => {
//                         try {
//                             await this.process(strategy, instrument, candle, tempBacktestTopicName);
//                             localCounter = localCounter + 1;

//                             return;
//                         } catch (err) {
//                             console.error(err);

//                             reject(err);
//                         }
//                     }, opts).then(() => {
//                         console.log('lock released');
//                         if (localCounter >= count) {
//                             resolve(true);
//                         }
//                     }).catch((err) => {
//                         console.error(err.message);
//                         reject(err);
//                     });
//                 }
//             }, (error) => {
//                 console.error(error);
//                 reject(error);
//             });
//         });
//     }

//     private subscribeToBacktestTopicToHandleEvents(
//         strategy: api.models.StrategyDocument,
//         instrumnet: api.enums.InstrumentEnum,
//         tempBacktestTopicName: string, count) {
//         const strategyBacktestConsumer = new api.proxies.StrategyBacktestConsumerProxy(tempBacktestTopicName);
//         // let model;
//         let report;
//         const totalPips = 0;
//         return new Promise((resolve, reject) => {
//             strategyBacktestConsumer.subscribe(count).subscribe(async (events) => {
//                 for (const event of events) {
//                     if (event.event === 'long' || event.event === 'short') {

//                         report = {
//                             strategyId: strategy.id,
//                             instrument: instrumnet,
//                             topic: tempBacktestTopicName,
//                             timeIn: event.time,
//                             candleIn: event.payload.close,
//                             tradeType: event.event,
//                         };
//                         this.reports.push(report);
//                         // let reportModel = new api.models.strategyBacktestReportModel(report);
//                         // model = await reportModel.save();
//                     } else if (event.event === 'out') {
//                         if (report) {
//                             report.timeOut = event.time;
//                             report.candleOut = event.payload.close;
//                             report.pips = report.tradeType === 'long'
//                                 ? report.candleOut - report.candleIn
//                                 : report.candleIn - report.candleOut;
//                             report.pips = report.pips * 100000;
//                             // await model.save();
//                         }
//                     }
//                 }
//                 resolve(true);
//             }, (error) => {
//                 console.error(error);
//                 reject(error);
//             });
//         });
//     }

//     private async callInstrumentServiceToFetchCandles(
//         instrument: api.enums.InstrumentEnum,
//         strategy: api.models.StrategyDocument,
//         tempCandlesTopicName: string) {
//         const proxy = new api.proxies.InstrumentProxy();
//         // return await proxy.getCandles(api.enums.InstrumentEnum[instrument], strategy.granularity,
//         //  tempCandlesTopicName);
//         return { body: { count: 10 } };

//     }

//     private async process(
//         strategy: api.models.StrategyDocument, instrument: api.enums.InstrumentEnum,
//         candle: api.interfaces.Candle, topicName: string) {

//         // get snapshot of strategy-backtest event from db

//         // let snapshot = await api.models.strategyBacktestSnapshotModel.findLastBacktestSnapshot(topicName);
//         const snapshot = this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;

//         const eventHandler = new api.services.RaisingCandles();
//         const time: Date = snapshot ? snapshot.time : new Date(1900, 1, 1);

//         // if snapshot, then replay channel from snapshot's offset and resolve the last status
//         // progress based on the last status and current candle and get the current status
//         // insert the current status (snapshot) if needed into db -- needed means current status is out (maybe)
//         // push the current status into channel -- finish

//         // let events = await api.models.strategyBacktestEventModel.findBacktestEventsToReplay(topicName, time);
//         const events = this.events.filter((x) => x.time > time);

//         const newSnapshot = eventHandler.replay(snapshot, events);
//         if (newSnapshot) {
//             const snapshotToSave = {
//                 topic: topicName,
//                 time: newSnapshot.time,
//                 payload: newSnapshot.payload,
//             };
//             this.snapshots.push(snapshotToSave);
//             // let snapshotDocument = new api.models.strategyBacktestSnapshotModel(snapshot);
//             // await snapshotDocument.save();

//         }
//         const result = await eventHandler.processCandle(candle);
//         const event = {
//             topic: topicName,
//             time: candle.time,
//             isDispatched: false,
//             event: result.event,
//             payload: result.payload,
//         };
//         this.events.push(event);
//         // let eventDocument = new api.models.strategyBacktestEventModel(event);
//         // await eventDocument.save();
//     }

//     private async generateTempTopicForBacktest(strategyId, instrument) {
//         const topic = `temp_${strategyId}_${Date.now()}`;
//         await new api.proxies.StrategyBacktestConsumerProxy(topic).createTopic();
//         return topic;
//     }

//     private async generateTempTopicForCandles(
//         instrument: api.enums.InstrumentEnum,
//         granularity: api.enums.GranularityEnum) {

//         const audUsdM5Topic = `temp_audUsdM5_${Date.now()}`;
//         switch (instrument) {
//             case api.enums.InstrumentEnum.AUD_USD:
//                 switch (granularity) {
//                     case api.enums.GranularityEnum.M5:
//                         await new api.proxies.CandleConsumerProxy(audUsdM5Topic).createTopic();
//                         return audUsdM5Topic;
//                 }
//                 break;
//         }
//         throw new Error('cannot find the topic name!');
//     }
// }
