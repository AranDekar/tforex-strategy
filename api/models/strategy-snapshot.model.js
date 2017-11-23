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
let mongoose = api.shared.DataAccess.mongooseInstance;
let schema = new mongoose_1.Schema({
    topic: { type: String },
    time: { type: Number },
    payload: { type: mongoose_1.Schema.Types.Mixed },
});
schema.statics.findLastBacktestSnapshot = (topic) => __awaiter(this, void 0, void 0, function* () {
    return exports.strategyBacktestSnapshotModel
        .findOne({ topic: topic })
        .sort({ 'time': -1 })
        .exec();
});
schema.statics.findLastLiveSnapshot = (topic) => __awaiter(this, void 0, void 0, function* () {
    return exports.strategyLiveSnapshotModel
        .findOne({ topic: topic })
        .sort({ 'time': -1 })
        .exec();
});
exports.strategyLiveSnapshotModel = mongoose.model('strategy_live_snapshot', schema);
exports.strategyBacktestSnapshotModel = mongoose.model('strategy_backtest_snapshot', schema);
//# sourceMappingURL=strategy-snapshot.model.js.map