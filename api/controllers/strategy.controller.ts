import * as api from '../../api';

export function get(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    let _id = req.swagger.params._id.value;
    let result = {
        id: '1',
        name: 'test',
        createdTime: new Date().toISOString(),
        description: 'test',
        granularity: api.GranularityEnum[api.GranularityEnum.M5],
        isActive: true
    };
    // this sends back a JSON response which is a single string
    res.json([result]);
}

export function post(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    let service = new api.StrategyService();
    let result = service.create(req.body);
    res.json([result]);
}
