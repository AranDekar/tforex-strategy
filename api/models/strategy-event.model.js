"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
let mongoose = api.shared.DataAccess.mongooseInstance;
let schema = new mongoose_1.Schema({
    strategyId: { type: mongoose_1.Schema.Types.ObjectId },
    instrumentId: { type: mongoose_1.Schema.Types.ObjectId },
    isDispatched: { type: Boolean, default: false },
    time: { type: String },
    event: { type: String, enum: ['in', 'out', 'pending'] },
    payload: { type: mongoose_1.Schema.Types.Mixed },
});
exports.strategyEventModel = mongoose.model('strategy_event', schema);

//# sourceMappingURL=strategy-event.model.js.map
