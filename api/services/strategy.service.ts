const asyncLock = require('async-lock');

import * as api from '../../api';
import { StrategyDocument, StrategyEvent } from '../models';
import { InstrumentEventEnum } from '../enums';

export class StrategyService {

    public async getAll(): Promise<api.models.StrategyDocument[]> {
        return await api.models.strategyModel.find().exec();
    }

    public async getById(id: string): Promise<api.models.StrategyDocument | null> {
        return await api.models.strategyModel.findById(id).exec();
    }

    public async create(strategy: api.models.Strategy): Promise<api.models.StrategyDocument> {
        const model = new api.models.strategyModel(strategy);
        await model.save();
        return model;
    }

    public async setEvents(id: string, events: InstrumentEventEnum[]): Promise<api.models.StrategyDocument> {
        const data = await this.getById(id);
        if (!data) {
            throw new Error('strategy not found!');
        }
        data.events = events;
        await data.save();
        return data;
    }
}
