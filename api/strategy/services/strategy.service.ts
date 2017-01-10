import * as api from '../../strategy';

export class StrategyService {
    public async get(id: string | null = null): Promise<api.StrategyDocument[]> {
        if (id) {
            return await api.strategyModel.find({ id: id }).exec();
        } else {
            return await api.strategyModel.find().exec();
        }
    }

    public async create(strategy: api.Strategy): Promise<api.StrategyDocument> {
        let model = new api.strategyModel(strategy);
        await model.save();
        return model;
    }
}
