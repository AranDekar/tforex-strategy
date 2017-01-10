import { Document, Schema, Model, Types } from 'mongoose';

import * as api from '../../../api';

let mongoose = api.DataAccess.mongooseInstance;

export interface StrategyProcessQuery {
    strategyId: string | number;
    instrumentId: string | number;
    status: string;
    time: string;
    pips: number;
}

export interface StrategyProcessQueryDocument extends api.StrategyProcessQuery, Document {
}

let schema = new Schema({
    strategyId: { type: Schema.Types.ObjectId, required: 'strategyId is required' },
    instrumentId: { type: Schema.Types.ObjectId, required: 'instrumentId is required' },
    status: { type: String, enum: ['in', 'out', 'pending'], required: 'status is required' },
    time: { type: String, required: 'time is required' },
    pips: { type: String, required: 'time is required' },
});

export let strategyProcessQueryModel = mongoose.model<StrategyProcessQueryDocument>('strategyprocessquery', schema);
