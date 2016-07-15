import * as api from '../../api';

export class StrategyService {
    public async get(id: string = null): Promise<api.Strategy[]> {
        let result: api.Strategy[] = [];
        let data = await api.StrategyModel.find({}).exec();
        for (let item of data) {
            result.push({
                id: item.id,
                createdTime: item.createdTime,
                name: item.name,
                description: item.description,
                granularity: item.granularity,
                isActive: item.isActive,
            });
        }
        return result;
    }

    public async create(strategy: api.Strategy): Promise<any> {
        let model = new api.StrategyModel(strategy);
        await model.save();
        let data: api.Strategy = {
            id: model.id,
            createdTime: model.createdTime,
            name: model.name,
            description: model.description,
            granularity: model.granularity,
            isActive: model.isActive,
        };
        return data;
    }
}
