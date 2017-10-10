import { Document, Schema, Model, Types } from 'mongoose';

import * as api from '../../api';

let mongoose = api.shared.DataAccess.mongooseInstance;

export interface StrategyBacktestQuery {
    strategyId: string | number;
    status: string;
    time: string;
    pips: number;
}

export interface StrategyBacktestQueryDocument extends StrategyBacktestQuery, Document {
}

let schema = new Schema({
    strategyId: { type: Schema.Types.ObjectId, required: 'strategyId is required' },
    status: { type: String, enum: ['running', 'done'], required: 'status is required' },
    time: { type: String, required: 'time is required' },
    pips: { type: String, required: 'pips is required' },
});

export let strategyBacktestQueryModel = mongoose.model<StrategyBacktestQueryDocument>('strategy_backtest_query', schema);
