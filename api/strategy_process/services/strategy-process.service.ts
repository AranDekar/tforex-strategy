import * as api from '../../../api';

export class StrategyProcessService {

    public async start(strategyId: string | number, instrument: api.InstrumentEnum) {
        let svc = new api.StrategyService();
        let strategies = await svc.get(strategyId);
        if (!strategies || strategies.length !== 1) {
            throw new Error('strategy cannot be found!');
        }
        let strategy = strategies[0];

        let topic = strategy.name.concat(api.InstrumentEnum[instrument]);
        // listen to the messages that are to come from candle service to backtest
        api.StrategyProcessMessageConsumerService.backtest(topic);
        // ask candle service to provide backtest data
        let candleService = new api.CandleProxyService();
        await candleService.getHistoryData(api.InstrumentEnum[instrument], api.GranularityEnum[strategy.granularity], topic);
        return 1;
    }
    public process(candle: api.Candle) {
        return null;
    }
}