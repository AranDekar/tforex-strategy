"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
const mongoose = api.shared.DataAccess.mongooseInstance;
const schema = new mongoose_1.Schema({
    strategyRevision: { type: mongoose_1.Schema.Types.ObjectId, ref: 'strategy_revisions' },
    instrument: { type: String, required: 'instrumentId is required' },
    isDispatched: { type: Boolean, default: false },
    candleTime: { type: Date },
    time: { type: Date },
    event: { type: String },
    payload: { type: mongoose_1.Schema.Types.Mixed },
});
schema.index({ time: 1 }); // schema level ascending index on candleTime
schema.statics.findUndispatchedEvents = async () => {
    return exports.strategyEventModel
        .find({ isDispatched: false })
        .sort({ time: 1 })
        .exec();
};
exports.strategyEventModel = mongoose.model('strategy_events', schema);
//# sourceMappingURL=strategy-event.model.js.map