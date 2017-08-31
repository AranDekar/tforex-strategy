"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../strategy");
let mongoose = api.DataAccess.mongooseInstance;
let schema = new mongoose_1.Schema({
    strategyId: { type: mongoose_1.Schema.Types.ObjectId, required: 'strategyId is required' },
    instrumentId: { type: mongoose_1.Schema.Types.ObjectId, required: 'instrumentId is required' },
    status: { type: String, enum: ['in', 'out', 'pending'], required: 'status is required' },
    time: { type: String, required: 'time is required' },
    pips: { type: String, required: 'time is required' },
});
exports.strategyQueryModel = mongoose.model('strategy_query', schema);

//# sourceMappingURL=strategy-query.model.js.map
