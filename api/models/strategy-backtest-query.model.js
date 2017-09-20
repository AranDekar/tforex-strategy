"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
let mongoose = api.DataAccess.mongooseInstance;
let schema = new mongoose_1.Schema({
    strategyId: { type: mongoose_1.Schema.Types.ObjectId, required: 'strategyId is required' },
    status: { type: String, enum: ['running', 'done'], required: 'status is required' },
    time: { type: String, required: 'time is required' },
    pips: { type: String, required: 'pips is required' },
});
exports.strategyBacktestQueryModel = mongoose.model('strategy_backtest_query', schema);

//# sourceMappingURL=strategy-backtest-query.model.js.map
