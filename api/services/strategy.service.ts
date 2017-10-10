import * as api from '../../api';

export class StrategyService {
    public async get(id: string | number | null = null): Promise<api.models.StrategyDocument[]> {
        if (id) {
            return await api.models.strategyModel.find({ id: id }).exec();
        } else {
            return await api.models.strategyModel.find().exec();
        }
    }

    public async create(strategy: api.models.Strategy): Promise<api.models.StrategyDocument> {
        let model = new api.models.strategyModel(strategy);
        await model.save();
        return model;
    }


    public async backtest(strategyId: string | number, instrument: api.enums.InstrumentEnum) {
        let svc = new api.services.StrategyService();
        let strategies = await svc.get(strategyId);
        if (!strategies || strategies.length !== 1) {
            throw new Error('strategy cannot be found!');
        }
        let strategy = strategies[0];
        let topic = this.findTopicName(instrument, api.enums.GranularityEnum[strategy.granularity]);

        let groupId = `${strategy.name}-${topic}`;

        let kafkaConsumer = new api.proxies.InstrumentGranularityTopicConsumerProxy(topic, groupId);

        kafkaConsumer.subscribe().map(x => x).subscribe(
            candle => { return; },
            error => { return; },
        );
    }
    public process(candle: api.interfaces.Candle) {
        return null;
    }

    private findTopicName(instrument: api.enums.InstrumentEnum, granularity: api.enums.GranularityEnum):
        string {

        const audUsdM5Topic = 'audUsdM5';
        switch (instrument) {
            case api.enums.InstrumentEnum.AUD_USD:
                switch (granularity) {
                    case api.enums.GranularityEnum.M5:
                        return audUsdM5Topic;
                }
                break;
        }
        throw new Error('cannot find the topic name!');
    }
}
