import * as api from '../../api';

export async function postBacktest(req, res, next) {
    const strategyRevisionId = req.swagger.params.strategyRevisionId.value;
    try {
        const backtestService = new api.services.StrategyBacktestService();
        const numberOfEvents = await backtestService.backtest(strategyRevisionId);
        res.status(200).send({ message: `${numberOfEvents} events are being processed to backtest the strategy` });
    } catch (err) {
        res.statusCode = 400; // bad request
        res.json({ message: err.message });
    }
}
