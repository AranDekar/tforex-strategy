import * as api from '../../api';

export async function get(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    // let _id = req.swagger.params._id.value;    
    try {
        let service = new api.StrategyService();
        let data = await service.get();
        res.json(data);
    } catch (err) {
        throw new Error(err);
    }
}

export async function post(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    let service = new api.StrategyService();
    let result = await service.create(req.body);
    res.json(result);
}
