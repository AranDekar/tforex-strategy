import { Document, Schema, Model } from 'mongoose';
import * as api from '../../api';

const mongoose = api.shared.DataAccess.mongooseInstance;

export interface StrategyEvent {
    strategyRevision: string | number;
    instrument: api.enums.InstrumentEnum;
    isDispatched: boolean;
    candleTime: Date;
    event: string;
    payload: any;
    time: Date;
}
export interface StrategyEventDocument extends Document, StrategyEvent { }
export interface StrategyEventDocumentOperations extends Model<StrategyEventDocument> {
    findUndispatchedEvents(): Promise<StrategyEventDocument[]>;
}

const schema = new Schema({
    strategyRevision: { type: Schema.Types.ObjectId, ref: 'strategy_revisions' },
    instrument: { type: String, required: 'instrumentId is required' },
    isDispatched: { type: Boolean, default: false },
    candleTime: { type: Date },
    time: { type: Date },
    event: { type: String },
    payload: { type: Schema.Types.Mixed },
});

schema.index({ time: 1 }); // schema level ascending index on candleTime

schema.statics.findUndispatchedEvents = async () => {
    return strategyEventModel
        .find({ isDispatched: false })
        .sort({ time: 1 })
        .exec();
};

export let strategyEventModel = mongoose.model<StrategyEventDocument>(
    'strategy_events', schema) as StrategyEventDocumentOperations;
