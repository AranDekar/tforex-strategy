import * as api from '../../api';

export class StrategyService {

    constructor() { }

    public create(strategy: api.Strategy): api.Strategy {
        let model = new api.StrategyModel(strategy);

        model.createdTime = new Date();

        model.save();

        strategy.id = model._id.toHexString();
        strategy.createdTime = model.createdTime.toISOString();
        strategy.granularity = api.GranularityEnum[model.granularity];
        strategy.isActive = model.isActive;

        return strategy;
    }
}