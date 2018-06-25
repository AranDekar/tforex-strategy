"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncLock = require("async-lock");
const api = require("../../api");
class StrategyService {
    async getAll() {
        return await api.models.strategyModel.find().exec();
    }
    async getById(id) {
        return await api.models.strategyModel.findById(id).exec();
    }
    async create(strategy) {
        const model = new api.models.strategyModel(strategy);
        await model.save();
        return model;
    }
    async setEvents(id, events) {
        const data = await this.getById(id);
        if (!data) {
            throw new Error('strategy not found!');
        }
        data.events = events;
        await data.save();
        return data;
    }
    async getRevisionById(id) {
        return await api.models.strategyRevisionModel.findById(id).exec();
    }
    async addRevision(strategyRevision) {
        let revisionModel;
        const lock = new asyncLock();
        const key = '';
        const opts = undefined;
        return new Promise((resolve, reject) => {
            lock.acquire(key, async () => {
                const strategy = await api.models.strategyModel
                    .findById(strategyRevision.strategy)
                    .exec();
                if (!strategy) {
                    throw new Error('strategy not found!');
                }
                const revisions = await api.models.strategyRevisionModel
                    .find({ strategy: strategyRevision.strategy })
                    .exec();
                let maxNumber = 0;
                if (revisions.length > 0) {
                    maxNumber = Math.max(...revisions.map((x) => x.number));
                }
                strategyRevision.number = maxNumber + 1;
                revisionModel = new api.models.strategyRevisionModel(strategyRevision);
                await revisionModel.save();
                strategy.strategyRevisions.push(revisionModel.id);
                await strategy.save();
                return revisionModel;
            }, opts).then(() => {
                console.log('lock released');
                return resolve(revisionModel);
            }).catch((err) => {
                console.error(err.message);
                return reject(err);
            });
        });
    }
    async updateRevision(strategyRevisionId, strategyRevision) {
        let revisionModel;
        revisionModel = await api.models.strategyRevisionModel
            .findById(strategyRevisionId)
            .exec();
        if (!revisionModel || revisionModel.id !== strategyRevisionId) {
            throw new Error('revisionModel not found!');
        }
        revisionModel.code = strategyRevision.code;
        await revisionModel.save();
        return revisionModel;
    }
}
exports.StrategyService = StrategyService;
//# sourceMappingURL=strategy.service.js.map