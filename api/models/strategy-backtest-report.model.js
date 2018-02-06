"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
const mongoose = api.shared.DataAccess.mongooseInstance;
const schema = new mongoose_1.Schema({
    strategyId: { type: mongoose_1.Schema.Types.ObjectId, required: 'strategyId is required' },
    instrument: { type: String, required: 'instrumentId is required' },
    topic: { type: String, required: 'Topic is required' },
    timeIn: Number,
    timeOut: Number,
    candleIn: Number,
    candleOut: Number,
    tradeType: { type: String, enum: ['long', 'short'], required: 'trade type is required' },
    pips: { type: Number },
});
exports.strategyBacktestReportModel = mongoose.model('strategy_backtest_report', schema);
//# sourceMappingURL=strategy-backtest-report.model.js.map