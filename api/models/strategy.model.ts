import { Document, Schema } from 'mongoose';

import * as api from '../../api';


let mongoose = api.DataAccess.mongooseInstance;

interface StrategyOperation {
    suspend(): void;
}

export interface StrategyModel extends api.Strategy, StrategyOperation, Document { }

let schema = new Schema({
    name: { type: String, trim: true, required: 'name is required' },
    description: { type: String, trim: true, required: 'name is required' },
    createdTime: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    granularity: { type: String, default: 'M5', enum: ['M1', 'M5', 'M15', 'M30', 'H1', 'H4'], required: 'granularity is required' },
    postedBy: { type: Schema.Types.ObjectId, required: 'postedBy is required' },
});

schema.methods.suspend = () => {
    this.isActive = false;
};

export let strategyModel = mongoose.model<StrategyModel>('strategy', schema);
