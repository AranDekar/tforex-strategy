import * as api from '../../api';

export async function get(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    // let _id = req.swagger.params._id.value;    
    try {
        let result: api.Strategy[] = [];
        let service = new api.StrategyService();
        let data = await service.get();
        for (let item of data) {
            result.push({
                id: item.id,
                createdTime: item.createdTime,
                name: item.name,
                description: item.description,
                granularity: item.granularity,
                isActive: item.isActive,
                postedBy: item.postedBy,
            });
        }
        res.json(result);
    } catch (err) {
        throw new Error(err);
    }
}

export async function post(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    let service = new api.StrategyService();
    let model = await service.create(req.body);
    let data: api.Strategy = {
        id: model.id,
        createdTime: model.createdTime,
        name: model.name,
        description: model.description,
        granularity: model.granularity,
        isActive: model.isActive,
        postedBy: model.postedBy,
    };
    res.json(data);
}
