"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../strategy");
let mongoose = api.DataAccess.mongooseInstance;
let schema = new mongoose_1.Schema({
    name: { type: String, trim: true, required: 'name is required' },
    description: { type: String, trim: true, required: 'name is required' },
    createdTime: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    granularity: { type: String, default: 'M5', enum: ['M1', 'M5', 'M15', 'M30', 'H1', 'H4'], required: 'granularity is required' },
    postedBy: { type: mongoose_1.Schema.Types.ObjectId, required: 'postedBy is required' },
});
exports.strategyModel = mongoose.model('strategy', schema);

//# sourceMappingURL=strategy.model.js.map
