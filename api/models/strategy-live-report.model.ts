import { Document, Schema, Model, Types } from 'mongoose';

import * as api from '../../api';

let mongoose = api.shared.DataAccess.mongooseInstance;

export interface StrategyQuery {
    strategyId: string | number;
    instrumentId: string | number;
    topic: string;
    status: string;
    time: number;
    pips: number;
}

export interface StrategyQueryDocument extends StrategyQuery, Document {
}

let schema = new Schema({
    strategyId: { type: Schema.Types.ObjectId, required: 'strategyId is required' },
    instrumentId: { type: Schema.Types.ObjectId, required: 'instrumentId is required' },
    topic: { type: String, required: 'Topic is required' },
    status: { type: String, enum: ['in', 'out', 'pending'], required: 'status is required' },
    time: { type: Number, required: 'time is required' },
    pips: { type: String, required: 'time is required' },
});

export let strategyLiveQueryModel = mongoose.model<StrategyQueryDocument>('strategy_live_query', schema);
export let strategyBacktestQueryModel = mongoose.model<StrategyQueryDocument>('strategy_backtest_query', schema);
