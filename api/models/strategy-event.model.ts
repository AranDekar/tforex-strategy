import { Document, Schema } from 'mongoose';
import * as api from '../../api';

let mongoose = api.DataAccess.mongooseInstance;

export interface StrategyEvent {
    strategyId: string | number;
    instrumentId: string | number;
    isDispatched: boolean;
    time: string;
    event: string;
    payload: any;
}

export interface StrategyEventDocument extends StrategyEvent, Document {
}

let schema = new Schema({
    strategyId: { type: Schema.Types.ObjectId },
    instrumentId: { type: Schema.Types.ObjectId },
    isDispatched: { type: Boolean, default: false },
    time: { type: String },
    event: { type: String, enum: ['in', 'out', 'pending'] },
    payload: { type: Schema.Types.Mixed },
});

export let strategyEventModel = mongoose.model<StrategyEventDocument>('strategy_event', schema);
