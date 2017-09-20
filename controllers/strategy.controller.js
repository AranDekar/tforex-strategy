"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("../../strategy");
function get(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
        // let _id = req.swagger.params._id.value;
        try {
            let result = [];
            let service = new api.StrategyService();
            let data = yield service.get();
            res.json(result);
        }
        catch (err) {
            throw new Error(err);
        }
    });
}
exports.get = get;
function post(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
        let service = new api.StrategyService();
        let model = yield service.create(req.body);
        res.json(model);
    });
}
exports.post = post;
function backtest(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let body = req.body;
        if (!body || !body.strategy || !body.instrument) {
            throw new Error('input arguments are not passed correctly!');
        }
        try {
            let srv = new api.StrategyService();
            yield srv.backtest(body.strategy, body.instrument);
            res.status(200).send({ message: 'backtesting strategy' });
        }
        catch (err) {
            res.statusCode = 500; // internal server error
            next(err);
        }
    });
}
exports.backtest = backtest;

//# sourceMappingURL=strategy.controller.js.map
