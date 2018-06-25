"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("../../api");
async function get(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    // let _id = req.swagger.params._id.value;
    try {
        const result = [];
        const service = new api.services.StrategyService();
        const data = await service.getAll();
        res.json(data);
    }
    catch (err) {
        throw new Error(err);
    }
}
exports.get = get;
async function post(req, res, next) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    try {
        const service = new api.services.StrategyService();
        const model = await service.create(req.body);
        res.json(model);
    }
    catch (err) {
        res.statusCode = 400; // bad request
        res.json({ message: err.message });
    }
}
exports.post = post;
//# sourceMappingURL=strategy.controller.js.map