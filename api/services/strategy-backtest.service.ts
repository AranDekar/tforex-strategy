let asyncLock = require('async-lock');

import * as api from '../../api';

export class StrategyBacktestService {
    public async backtest(strategy: api.models.StrategyDocument, instrument: api.enums.InstrumentEnum) {
        // delete the snapshot
        let tempBacktestTopicName = await this.generateTempTopicForBacktest(strategy.id, instrument);
        let tempCandlesTopicName = await this.generateTempTopicForCandles(instrument, api.enums.GranularityEnum[strategy.granularity]);
        let candleConsumer = new api.proxies.CandleConsumerProxy(tempCandlesTopicName);

        // should await otherwise it gets the topic does not exist from this service
        await this.callInstrumentServiceToFetchCandles(instrument, strategy, tempCandlesTopicName);

        this.subscribeToCandlesTopicToBacktest(candleConsumer, strategy, instrument, tempBacktestTopicName);

        this.subscribeToBacktestTopicToHandleEvents(strategy, instrument, tempBacktestTopicName);

    }

    private subscribeToCandlesTopicToBacktest(candleConsumer: api.proxies.CandleConsumerProxy,
        strategy: api.models.StrategyDocument,
        instrument: api.enums.InstrumentEnum, tempBacktestTopicName: string) {
        let lock = new asyncLock();
        let key, opts = null;
        candleConsumer.subscribe().subscribe(candle => {
            lock.acquire(key, async () => {
                await this.process(strategy, instrument, candle, tempBacktestTopicName);
                return;
            }, opts).then(function () {
                console.log('lock released');
            }).catch(function (err) {
                console.error(err.message);
            });
        }, error => { console.error(error); });
    }

    private subscribeToBacktestTopicToHandleEvents(strategy: api.models.StrategyDocument, instrumnet: api.enums.InstrumentEnum,
        tempBacktestTopicName: string) {
        let strategyBacktestConsumer = new api.proxies.StrategyBacktestConsumerProxy(tempBacktestTopicName);
        let model;
        let totalPips = 0;
        strategyBacktestConsumer.subscribe().subscribe(async event => {

            if (event.event === "long" || event.event === "short") {
                let report = new api.models.strategyBacktestReportModel({
                    strategyId: strategy.id,
                    instrument: instrumnet,
                    topic: tempBacktestTopicName,
                    timeIn: event.time,
                    candleIn: event.payload.close,
                    tradeType: event.event,
                });
                model = await report.save();
            } else if (event.event === "out") {
                if (model) {
                    model.timeOut = event.time;
                    model.candleOut = event.payload.close;
                    model.pips = model.tradeType === 'long' ? model.candleOut - model.candleIn : model.candleIn - model.candleOut;
                    model.pips = model.pips * 100000;
                    await model.save();
                }
            }
        }, error => { console.error(error); });
    }

    private async callInstrumentServiceToFetchCandles(instrument: api.enums.InstrumentEnum,
        strategy: api.models.StrategyDocument,
        tempCandlesTopicName: string) {
        let proxy = new api.proxies.InstrumentProxy();
        let count = await proxy.getCandles(api.enums.InstrumentEnum[instrument], strategy.granularity, tempCandlesTopicName);
    }

    private async process(strategy: api.models.StrategyDocument, instrument: api.enums.InstrumentEnum,
        candle: api.interfaces.Candle, topicName: string) {
        // get snapshot of strategy-backtest event from db
        let snapshot = await api.models.strategyBacktestSnapshotModel.findLastBacktestSnapshot(topicName);
        let eventHandler = new api.services.RaisingCandles();
        let time: number = snapshot ? snapshot.time : 0;

        // if snapshot, then replay channel from snapshot's offset and resolve the last status
        // progress based on the last status and current candle and get the current status
        // insert the current status (snapshot) if needed into db -- needed means current status is out (maybe)
        // push the current status into channel -- finish
        let events = await api.models.strategyBacktestEventModel.findBacktestEventsToReplay(topicName, time);
        let newSnapshot = eventHandler.replay(snapshot, events);
        if (newSnapshot) {
            let snapshotDocument = new api.models.strategyBacktestSnapshotModel({
                topic: topicName,
                time: newSnapshot.time,
                payload: newSnapshot.payload,
            });
            await snapshotDocument.save();
        }
        let result = await eventHandler.processCandle(candle);

        let eventDocument = new api.models.strategyBacktestEventModel({
            topic: topicName,
            time: Number(candle.time),
            isDispatched: false,
            event: result.event,
            payload: result.payload,
        });
        await eventDocument.save();
        let producer = new api.proxies.StrategyBacktestProducerProxy(topicName);
        await producer.publish();
    }

    private async generateTempTopicForBacktest(strategyId, instrument) {
        let topic = `temp_${strategyId}_${Date.now()}`;
        await new api.proxies.StrategyBacktestConsumerProxy(topic).createTopic();
        return topic;
    }

    private async generateTempTopicForCandles(instrument: api.enums.InstrumentEnum,
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
