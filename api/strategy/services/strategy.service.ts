import * as api from '../../strategy';

export class StrategyService {
    public async get(id: string | number | null = null): Promise<api.Model.StrategyDocument[]> {
        if (id) {
            return await api.Model.strategyModel.find({ id: id }).exec();
        } else {
            return await api.Model.strategyModel.find().exec();
        }
    }

    public async create(strategy: api.Model.Strategy): Promise<api.Model.StrategyDocument> {
        let model = new api.Model.strategyModel(strategy);
        await model.save();
        return model;
    }


    public async backtest(strategyId: string | number, instrument: api.InstrumentEnum) {
        let svc = new api.StrategyService();
        let strategies = await svc.get(strategyId);
        if (!strategies || strategies.length !== 1) {
            throw new Error('strategy cannot be found!');
        }
        let strategy = strategies[0];
        let topic = strategy.name.concat(api.InstrumentEnum[instrument]);
        // listen to the messages that are to come from candle service to backtest
        let kafkaConsumer = new api.BacktestConsumerProxy();
        kafkaConsumer.onNewCandleReceived$.subscribe(
            candle => {
                return;
            },
            err => {
                return;
            });

        kafkaConsumer.backtest(topic);

        // ask candle service to provide backtest data
        let candleProxy = new api.CandleProxy();
        await candleProxy.getHistoryData(api.InstrumentEnum[instrument], api.GranularityEnum[strategy.granularity], topic);
        return 1;
    }

    public process(candle: api.Candle) {
        return null;
    }
}
