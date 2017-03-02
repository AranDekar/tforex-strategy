import * as api from '../../../api';

export async function backtest(req, res, next) {
    let body = req.body;
    if (!body || !body.strategy || !body.instrument) {
        throw new Error('input arguments are not passed correctly!');
    }
    try {
        let srv = new api.StrategyProcessService();
        await srv.start(body.strategy, body.instrument);
        res.json(`backtesting strategy...`);
    } catch (err) {
        res.statusCode = 500; // internal server error
        next(err);
    }
}