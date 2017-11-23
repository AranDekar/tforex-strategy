import { Document, Schema, Model } from 'mongoose';
import * as api from '../../api';

let mongoose = api.shared.DataAccess.mongooseInstance;

export interface StrategyEventDocument extends Document {
    topic: string;
    isDispatched: boolean;
    time: number;
    event: string;
    payload: any;
}
export interface StrategyEventDocumentOperations extends Model<StrategyEventDocument> {
    findUndispatchedBacktestEvents(topic: string): Promise<StrategyEventDocument[]>;
    findUndispatchedLiveEvents(topic: string): Promise<StrategyEventDocument[]>;
    findBacktestEventsToReplay(topic: string, time: number): Promise<StrategyEventDocument[]>;
    findLiveEventsToReplay(topic: string, time: number): Promise<StrategyEventDocument[]>;
}

let schema = new Schema({
    topic: { type: String, index: true },
    isDispatched: { type: Boolean, default: false },
    time: { type: Number },
    event: { type: String },
    payload: { type: Schema.Types.Mixed },
});

schema.statics.findUndispatchedBacktestEvents = async (topic: string) => {
    return strategyBacktestEventModel
        .find({ isDispatched: false, topic: topic })
        .sort({ 'time': 1 })
        .exec();
};
schema.statics.findUndispatchedLiveEvents = async (topic: string) => {
    return strategyLiveEventModel
        .find({ isDispatched: false, topic: topic })
        .sort({ 'time': 1 })
        .exec();
};

schema.statics.findBacktestEventsToReplay = async (topic: string, time: number) => {
    return strategyBacktestEventModel
        .find({ time: { $gt: time }, topic: topic })
        .sort({ 'time': 1 })
        .exec();
};

schema.statics.findLiveEventsToReplay = async (topic: string, time: number) => {
    return strategyLiveEventModel
        .find({ time: { $gt: time }, topic: topic })
        .sort({ 'time': 1 })
        .exec();
};

export let strategyLiveEventModel = <StrategyEventDocumentOperations>mongoose.model<StrategyEventDocument>('strategy_live_event', schema);
export let strategyBacktestEventModel = <StrategyEventDocumentOperations>mongoose.model<StrategyEventDocument>('strategy_backtest_event',
    schema);
