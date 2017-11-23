import { Document, Schema, Model, Types } from 'mongoose';

import * as api from '../../api';

let mongoose = api.shared.DataAccess.mongooseInstance;

export interface StrategyBcktestReport {
    strategyId: string | number;
    instrument: string;
    topic: string;
    timeIn: number;
    timeOut: number;
    candleIn: number;
    candleOut: number;
    tradeType: string;
    pips: number;
}

export interface StrategyBacktestReportDocument extends StrategyBcktestReport, Document {
}

let schema = new Schema({
    strategyId: { type: Schema.Types.ObjectId, required: 'strategyId is required' },
    instrument: { type: String, required: 'instrumentId is required' },
    topic: { type: String, required: 'Topic is required' },
    timeIn: Number,
    timeOut: Number,
    candleIn: Number,
    candleOut: Number,
    tradeType: { type: String, enum: ['long', 'short'], required: 'trade type is required' },
    pips: { type: Number },
});

export let strategyBacktestReportModel = mongoose.model<StrategyBacktestReportDocument>('strategy_backtest_report', schema);
