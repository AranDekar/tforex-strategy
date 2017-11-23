import * as api from '../../api';

export async function get(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    // let _id = req.swagger.params._id.value;
    try {
        let result: api.models.Strategy[] = [];
        let service = new api.services.StrategyService();
        let data = await service.getAll();
        res.json(data);
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

    let instrument = req.swagger.params.instrument.value;
    let strategy = req.swagger.params.strategy.value;

    try {
        let strategyService = new api.services.StrategyService();
        let backtestService = new api.services.StrategyBacktestService();
        let strategyDocument = await strategyService.getById(strategy);
        if (strategyDocument) {
            await backtestService.backtest(strategyDocument, instrument);
            res.status(200).send({ message: 'backtesting strategy' });
        } else {
            throw new Error('strategy not found!');
        }
    } catch (err) {
        res.statusCode = 500; // internal server error
        next(err);
    }
}