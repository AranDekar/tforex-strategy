let asyncLock = require('async-lock');

import * as api from '../../api';

export class StrategyService {
    public async getAll(): Promise<api.models.StrategyDocument[]> {
        return await api.models.strategyModel.find().exec();
    }

    public async getById(id: string): Promise<api.models.StrategyDocument | null> {
        return await api.models.strategyModel.findById(id).exec();
    }

    public async create(strategy: api.models.Strategy): Promise<api.models.StrategyDocument> {
        let model = new api.models.strategyModel(strategy);
        await model.save();
        return model;
    }
}
