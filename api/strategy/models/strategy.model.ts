import { Document, Schema } from 'mongoose';
import * as api from '../../../api';

let mongoose = api.DataAccess.mongooseInstance;

export interface Strategy {
    name: string;
    description: string;
    createdTime: string;
    isActive: boolean;
    granularity: string;
    postedBy: string | number;
}

export interface StrategyDocument extends api.Strategy, Document {
}

let schema = new Schema({
    name: { type: String, trim: true, required: 'name is required' },
    description: { type: String, trim: true, required: 'name is required' },
    createdTime: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    granularity: { type: String, default: 'M5', enum: ['M1', 'M5', 'M15', 'M30', 'H1', 'H4'], required: 'granularity is required' },
    postedBy: { type: Schema.Types.ObjectId, required: 'postedBy is required' },
});

export let strategyModel = mongoose.model<StrategyDocument>('strategy', schema);
