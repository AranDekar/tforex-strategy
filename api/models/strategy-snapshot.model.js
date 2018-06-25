"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
const mongoose = api.shared.DataAccess.mongooseInstance;
const schema = new mongoose_1.Schema({
    topic: { type: String },
    time: { type: Date },
    payload: { type: mongoose_1.Schema.Types.Mixed },
});
schema.statics.findLastBacktestSnapshot = async (topic) => {
    return exports.strategyBacktestSnapshotModel
        .findOne({ topic })
        .sort({ time: -1 })
        .exec();
};
schema.statics.findLastLiveSnapshot = async (topic) => {
    return exports.strategyLiveSnapshotModel
        .findOne({ topic })
        .sort({ time: -1 })
        .exec();
};
exports.strategyLiveSnapshotModel = mongoose.model('strategy_live_snapshots', schema);
exports.strategyBacktestSnapshotModel = mongoose.model('strategy_backtest_snapshots', schema);
//# sourceMappingURL=strategy-snapshot.model.js.map