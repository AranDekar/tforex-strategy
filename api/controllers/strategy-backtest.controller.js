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
const api = require("../../api");
function postBacktest(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const instrument = req.swagger.params.instrument.value;
        const strategy = req.swagger.params.strategy.value;
        try {
            const backtestService = new api.services.StrategyBacktestService();
            const numberOfEvents = yield backtestService.backtest(strategy, instrument);
            res.status(200).send({ message: `${numberOfEvents} events are being processed to backtest the strategy` });
        }
        catch (err) {
            res.statusCode = 400; // bad request
            res.json({ message: err.message });
        }
    });
}
exports.postBacktest = postBacktest;
//# sourceMappingURL=strategy-backtest.controller.js.map