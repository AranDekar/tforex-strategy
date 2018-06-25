import { Document, Schema, Model, Types } from 'mongoose';

import * as api from '../../api';

const mongoose = api.shared.DataAccess.mongooseInstance;

export interface StrategyReport {
    strategyRevision: string | undefined;
    instrument: api.enums.InstrumentEnum;
    timeIn: Date;
    timeOut: Date | undefined;
    priceIn: number;
    priceOut: number | undefined;
    tradeType: string;
    pips: number;
    payload: any;
}

export interface StrategyReportDocument extends StrategyReport, Document {
}

const schema = new Schema({
    strategyRevision: { type: Schema.Types.ObjectId, ref: 'strategy_revisions' },
    instrument: { type: String, required: 'instrumentId is required' },
    timeIn: Date,
    timeOut: Date,
    priceIn: Number,
    priceOut: Number,
    tradeType: { type: String, enum: ['in_buy', 'in_sell'], required: 'trade type is required' },
    pips: { type: Number },
    payload: { type: Schema.Types.Mixed },
});

export let strategyReportModel = mongoose.model<StrategyReportDocument>(
    'strategy_reports', schema);
