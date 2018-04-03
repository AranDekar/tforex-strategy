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
function getEvents(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.swagger.params.id.value;
        try {
            const result = [];
            const service = new api.services.StrategyService();
            const data = yield service.getById(id);
            if (!data) {
                res.statusCode = 404; // not found
                return res.json({ message: 'strategy not found!' });
            }
            res.json(data.events);
        }
        catch (err) {
            res.statusCode = 400; // bad request
            res.json({ message: err.message });
            // return next({ message: err.message });
        }
    });
}
exports.getEvents = getEvents;
function postEvent(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.swagger.params.id.value;
        const events = req.swagger.params.events.value;
        try {
            const service = new api.services.StrategyService();
            const data = yield service.setEvents(id, events);
            res.json(data);
        }
        catch (err) {
            res.statusCode = 400; // bad request
            res.json({ message: err.message });
            // return next({ message: err.message });
        }
    });
}
exports.postEvent = postEvent;
//# sourceMappingURL=strategy-event.controller.js.map