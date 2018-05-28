import { Document, Schema, Model, Types } from 'mongoose';

import * as api from '../../api';

const mongoose = api.shared.DataAccess.mongooseInstance;

export interface StrategyBcktestReport {
    strategyId: string | undefined;
    instrument: api.enums.InstrumentEnum;
    topic: string;
    timeIn: Date;
    timeOut?: Date;
    priceIn: number;
    priceOut?: number;
    tradeType: string;
    pips?: number;
}

export interface StrategyBacktestReportDocument extends StrategyBcktestReport, Document {
}

const schema = new Schema({
    strategyId: { type: Schema.Types.ObjectId, required: 'strategyId is required' },
    instrument: { type: String, required: 'instrumentId is required' },
    topic: { type: String },
    timeIn: Date,
    timeOut: Date,
    priceIn: Number,
    priceOut: Number,
    tradeType: { type: String, enum: ['in_buy', 'in_sell'], required: 'trade type is required' },
    pips: { type: Number },
});

export let strategyBacktestReportModel = mongoose.model<StrategyBacktestReportDocument>(
    'strategy_backtest_report', schema);
