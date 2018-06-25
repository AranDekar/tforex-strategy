"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
const mongoose = api.shared.DataAccess.mongooseInstance;
const schema = new mongoose_1.Schema({
    strategyRevision: { type: mongoose_1.Schema.Types.ObjectId, ref: 'strategy_revisions' },
    instrument: { type: String, required: 'instrumentId is required' },
    total: Number,
    maxProfit: Number,
    maxLoss: Number,
    year: Number,
    monthly: [{ total: Number, maxProfit: Number, maxLoss: Number, month: String }],
    quarterly: [{ total: Number, maxProfit: Number, maxLoss: Number, quarter: String }],
    halfYearly: [{ total: Number, maxProfit: Number, maxLoss: Number, halfYear: String }],
});
exports.strategyReportSummaryModel = mongoose.model('strategy_report_summaries', schema);
//# sourceMappingURL=strategy-report-summary.model.js.map