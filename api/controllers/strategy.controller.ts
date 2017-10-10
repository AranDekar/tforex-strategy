import * as api from '../../api';

export async function get(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    // let _id = req.swagger.params._id.value;
    try {
        let result: api.models.Strategy[] = [];
        let service = new api.services.StrategyService();
        let data = await service.get();
        res.json(result);
    } catch (err) {
        throw new Error(err);
    }
}

export async function post(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    let service = new api.services.StrategyService();
    let model = await service.create(req.body);
    res.json(model);
}

export async function backtest(req, res, next) {
    let body = req.body;
    if (!body || !body.strategy || !body.instrument) {
        throw new Error('input arguments are not passed correctly!');
    }
    try {
        let srv = new api.services.StrategyService();
        await srv.backtest(body.strategy, body.instrument);
        res.status(200).send({ message: 'backtesting strategy' });
    } catch (err) {
        res.statusCode = 500; // internal server error
        next(err);
    }
}