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
const mongoose_1 = require("mongoose");
const api = require("../../api");
const mongoose = api.shared.DataAccess.mongooseInstance;
const schema = new mongoose_1.Schema({
    topic: { type: String, index: true },
    isDispatched: { type: Boolean, default: false },
    time: { type: Number },
    event: { type: String },
    payload: { type: mongoose_1.Schema.Types.Mixed },
});
schema.statics.findUndispatchedBacktestEvents = (topic) => __awaiter(this, void 0, void 0, function* () {
    return exports.strategyBacktestEventModel
        .find({ isDispatched: false, topic })
        .sort({ time: 1 })
        .exec();
});
schema.statics.findUndispatchedLiveEvents = (topic) => __awaiter(this, void 0, void 0, function* () {
    return exports.strategyLiveEventModel
        .find({ isDispatched: false, topic })
        .sort({ time: 1 })
        .exec();
});
schema.statics.findBacktestEventsToReplay = (topic, time) => __awaiter(this, void 0, void 0, function* () {
    return exports.strategyBacktestEventModel
        .find({ time: { $gt: time }, topic })
        .sort({ time: 1 })
        .exec();
});
schema.statics.findLiveEventsToReplay = (topic, time) => __awaiter(this, void 0, void 0, function* () {
    return exports.strategyLiveEventModel
        .find({ time: { $gt: time }, topic })
        .sort({ time: 1 })
        .exec();
});
exports.strategyLiveEventModel = mongoose.model('strategy_live_event', schema);
exports.strategyBacktestEventModel = mongoose.model('strategy_backtest_event', schema);
//# sourceMappingURL=strategy-event.model.js.map