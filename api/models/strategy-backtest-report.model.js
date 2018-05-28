"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
const mongoose = api.shared.DataAccess.mongooseInstance;
const schema = new mongoose_1.Schema({
    strategyId: { type: mongoose_1.Schema.Types.ObjectId, required: 'strategyId is required' },
    instrument: { type: String, required: 'instrumentId is required' },
    topic: { type: String },
    timeIn: Date,
    timeOut: Date,
    priceIn: Number,
    priceOut: Number,
    tradeType: { type: String, enum: ['in_buy', 'in_sell'], required: 'trade type is required' },
    pips: { type: Number },
});
exports.strategyBacktestReportModel = mongoose.model('strategy_backtest_report', schema);
//# sourceMappingURL=strategy-backtest-report.model.js.map