import { Document, Schema, Model } from 'mongoose';
import * as api from '../../api';

let mongoose = api.shared.DataAccess.mongooseInstance;

export interface StrategySnapshotDocument extends Document {
    topic: string;
    time: number;
    payload: any;
}
export interface StrategySnapshotDocumentOperations extends Model<StrategySnapshotDocument> {
    findLastBacktestSnapshot(topic: string): Promise<StrategySnapshotDocument>;
    findLastLiveSnapshot(topic: string): Promise<StrategySnapshotDocument>;
}

let schema = new Schema({
    topic: { type: String },
    time: { type: Number },
    payload: { type: Schema.Types.Mixed },
});

schema.statics.findLastBacktestSnapshot = async (topic: string) => {
    return strategyBacktestSnapshotModel
        .findOne({ topic: topic })
        .sort({ 'time': -1 })
        .exec();
};
schema.statics.findLastLiveSnapshot = async (topic: string) => {
    return strategyLiveSnapshotModel
        .findOne({ topic: topic })
        .sort({ 'time': -1 })
        .exec();
};

export const strategyLiveSnapshotModel = <StrategySnapshotDocumentOperations>mongoose.model<StrategySnapshotDocument>(
    'strategy_live_snapshot', schema);
export const strategyBacktestSnapshotModel = <StrategySnapshotDocumentOperations>mongoose.model<StrategySnapshotDocument>(
    'strategy_backtest_snapshot', schema);
