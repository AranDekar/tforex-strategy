"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
let mongoose = api.shared.DataAccess.mongooseInstance;
let schema = new mongoose_1.Schema({
    strategyId: { type: mongoose_1.Schema.Types.ObjectId, required: 'strategyId is required' },
    instrumentId: { type: mongoose_1.Schema.Types.ObjectId, required: 'instrumentId is required' },
    topic: { type: String, required: 'Topic is required' },
    status: { type: String, enum: ['in', 'out', 'pending'], required: 'status is required' },
    time: { type: Number, required: 'time is required' },
    pips: { type: String, required: 'time is required' },
});
exports.strategyLiveQueryModel = mongoose.model('strategy_live_query', schema);
exports.strategyBacktestQueryModel = mongoose.model('strategy_backtest_query', schema);
//# sourceMappingURL=strategy-live-report.model.js.map