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
const asyncLock = require('async-lock');
const api = require("../../api");
class StrategyService {
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield api.models.strategyModel.find().exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield api.models.strategyModel.findById(id).exec();
        });
    }
    create(strategy) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = new api.models.strategyModel(strategy);
            yield model.save();
            return model;
        });
    }
    setEvents(id, events) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getById(id);
            if (!data) {
                throw new Error('strategy not found!');
            }
            data.events = events;
            yield data.save();
            return data;
        });
    }
}
exports.StrategyService = StrategyService;
//# sourceMappingURL=strategy.service.js.map