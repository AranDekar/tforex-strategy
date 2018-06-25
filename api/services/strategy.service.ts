import * as  asyncLock from 'async-lock';

import * as api from '../../api';
import { StrategyDocument, StrategyEvent } from '../models';
import { InstrumentEventEnum } from '../enums';
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants';

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

    public async getRevisionById(id: string): Promise<api.models.StrategyRevisionDocument | null> {
        return await api.models.strategyRevisionModel.findById(id).exec();
    }

    public async addRevision(strategyRevision: api.models.StrategyRevision):
        Promise<api.models.StrategyRevisionDocument | undefined> {
        let revisionModel: api.models.StrategyRevisionDocument | undefined;
        const lock = new asyncLock();
        const key: string = '';
        const opts = undefined;
        return new Promise<api.models.StrategyRevisionDocument | undefined>((resolve, reject) => {
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

    public async updateRevision(strategyRevisionId: number, strategyRevision: api.models.StrategyRevisionDocument):
        Promise<api.models.StrategyRevisionDocument | undefined> {
        let revisionModel: api.models.StrategyRevisionDocument | null;
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
