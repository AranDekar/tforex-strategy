import { Mongoose, Schema, Document } from 'mongoose';

import * as api from '../../api';

let mongoose = new Mongoose();
mongoose.connect('mongodb://localhost/tforex-strategy');

interface StrategyEntity {
    name: string,
    description: string,
    createdTime: Date,
    isActive: boolean,
    granularity: api.GranularityEnum,

    suspend();
}

interface StrategyDocument extends StrategyEntity, Document { }


let schema = new Schema({
    name: { type: String, trim: true, required: 'name is required' },
    description: { type: String, trim: true, required: 'name is required' },
    createdTime: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    granularity: { type: String, default: 'M5', enum: ['M1', 'M5', 'M15', 'M30', 'H1', 'H4'], required: 'granularity is required' }
});

schema.methods.suspend = () => {
    this.isActive = false;
}

export let StrategyModel = mongoose.model<StrategyDocument>('Strategy', schema);
//export let StrategyModel = mongoose.model('Strategy', schema);