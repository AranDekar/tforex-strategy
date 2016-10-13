import * as api from '../../api';

export class StrategyService {
    public async get(id: string | null = null): Promise<api.StrategyModel[]> {
        let result: api.Strategy[] = [];
        let data = await api.strategyModel.find({}).exec();
        return data;
    }

    public async create(strategy: api.Strategy): Promise<api.StrategyModel> {
        let model = new api.strategyModel(strategy);
        await model.save();
        return model;
    }
}
