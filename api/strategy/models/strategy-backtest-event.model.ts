import { Document, Schema } from 'mongoose';
import * as api from '../../strategy';

let mongoose = api.DataAccess.mongooseInstance;

export interface StrategyBacktestEvent {
    strategyId: string | number;
    isDispatched: boolean;
    time: string;
    event: string;
    payload: any;
}

export interface StrategyBacktestEventDocument extends StrategyBacktestEvent, Document {
}

let schema = new Schema({
    strategyId: { type: Schema.Types.ObjectId },
    isDispatched: { type: Boolean, default: false },
    time: { type: String },
    event: { type: String, enum: ['running', 'done' ] },
    payload: { type: Schema.Types.Mixed },
});

export let strategyBAcktestEventModel = mongoose.model<StrategyBacktestEventDocument>('strategy_backtest_event', schema);
