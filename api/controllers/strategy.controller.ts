import * as api from '../../api';

export async function get(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    // let _id = req.swagger.params._id.value;
    try {
        const result: api.models.Strategy[] = [];
        const service = new api.services.StrategyService();
        const data = await service.getAll();
        res.json(data);
    } catch (err) {
        throw new Error(err);
    }
}

export async function post(req, res, next) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    try {
        const service = new api.services.StrategyService();
        const model = await service.create(req.body);
        res.json(model);
    } catch (err) {
        res.statusCode = 500; // internal server error
        next(err);
    }
}

export async function backtest(req, res, next) {

    const instrument = req.swagger.params.instrument.value;
    const strategy = req.swagger.params.strategy.value;

    try {
        const backtestService = new api.services.StrategyBacktestService();
        await backtestService.backtest(strategy, instrument);
        res.status(200).send({ message: 'backtesting strategy' });
    } catch (err) {
        res.statusCode = 500; // internal server error
        next(err);
    }
}