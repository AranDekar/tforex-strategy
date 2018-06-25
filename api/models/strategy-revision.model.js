"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
const mongoose = api.shared.DataAccess.mongooseInstance;
const schema = new mongoose_1.Schema({
    strategy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'strategies' },
    number: Number,
    code: String,
});
exports.strategyRevisionModel = mongoose.model('strategy_revisions', schema);
//# sourceMappingURL=strategy-revision.model.js.map