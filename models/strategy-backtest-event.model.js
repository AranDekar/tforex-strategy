"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
let mongoose = api.DataAccess.mongooseInstance;
let schema = new mongoose_1.Schema({
    strategyId: { type: mongoose_1.Schema.Types.ObjectId },
    isDispatched: { type: Boolean, default: false },
    time: { type: String },
    event: { type: String, enum: ['running', 'done'] },
    payload: { type: mongoose_1.Schema.Types.Mixed },
});
exports.strategyBAcktestEventModel = mongoose.model('strategy_backtest_event', schema);

//# sourceMappingURL=strategy-backtest-event.model.js.map
