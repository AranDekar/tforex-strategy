import { Document, Schema, Model, Types } from 'mongoose';

import * as api from '../../api';

const mongoose = api.shared.DataAccess.mongooseInstance;

export interface MonthlyReport {
    total: number;
    maxProfit: number;
    maxLoss: number;
    month: string;
}
export interface QuarterlyReport {
    total: number;
    maxProfit: number;
    maxLoss: number;
    quarter: string;
}
export interface HalfYearlyReport {
    total: number;
    maxProfit: number;
    maxLoss: number;
    halfYear: string;
}

export interface StrategyReportSummary {
    strategyRevision: string | undefined;
    instrument: api.enums.InstrumentEnum;
    total: number;
    maxProfit: number;
    maxLoss: number;
    year: number;

    monthly: MonthlyReport[];
    quarterly: QuarterlyReport[];
    halfYearly: HalfYearlyReport[];
}

export interface StrategyReportSummaryDocument extends StrategyReportSummary, Document {
}

const schema = new Schema({
    strategyRevision: { type: Schema.Types.ObjectId, ref: 'strategy_revisions' },
    instrument: { type: String, required: 'instrumentId is required' },
    total: Number,
    maxProfit: Number,
    maxLoss: Number,
    year: Number,
    monthly: [{ total: Number, maxProfit: Number, maxLoss: Number, month: String }],
    quarterly: [{ total: Number, maxProfit: Number, maxLoss: Number, quarter: String }],
    halfYearly: [{ total: Number, maxProfit: Number, maxLoss: Number, halfYear: String }],
});

export let strategyReportSummaryModel = mongoose.model<StrategyReportSummaryDocument>(
    'strategy_report_summaries', schema);
