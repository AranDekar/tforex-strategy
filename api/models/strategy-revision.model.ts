
import { Document, Schema } from 'mongoose';
import * as api from '../../api';

const mongoose = api.shared.DataAccess.mongooseInstance;
export interface StrategyRevision {
    strategy: api.models.Strategy;
    number: number;
    code: string;
}
export interface StrategyRevisionDocument extends StrategyRevision, Document {
}

const schema = new Schema({
    strategy: { type: Schema.Types.ObjectId, ref: 'strategies' },
    number: Number,
    code: String,
});

export let strategyRevisionModel = mongoose.model<StrategyRevisionDocument>('strategy_revisions', schema);
