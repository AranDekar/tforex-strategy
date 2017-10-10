"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("../../api");
class StrategyService {
    get(id = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (id) {
                return yield api.models.strategyModel.find({ id: id }).exec();
            }
            else {
                return yield api.models.strategyModel.find().exec();
            }
        });
    }
    create(strategy) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = new api.models.strategyModel(strategy);
            yield model.save();
            return model;
        });
    }
    backtest(strategyId, instrument) {
        return __awaiter(this, void 0, void 0, function* () {
            let svc = new api.services.StrategyService();
            let strategies = yield svc.get(strategyId);
            if (!strategies || strategies.length !== 1) {
                throw new Error('strategy cannot be found!');
            }
            let strategy = strategies[0];
            let topic = this.findTopicName(instrument, api.enums.GranularityEnum[strategy.granularity]);
            let groupId = `${strategy.name}-${topic}`;
            let kafkaConsumer = new api.proxies.InstrumentGranularityTopicConsumerProxy(topic, groupId);
            kafkaConsumer.subscribe().map(x => x).subscribe(candle => { return; }, error => { return; });
        });
    }
    process(candle) {
        return null;
    }
    findTopicName(instrument, granularity) {
        const audUsdM5Topic = 'audUsdM5';
        switch (instrument) {
            case api.enums.InstrumentEnum.AUD_USD:
                switch (granularity) {
                    case api.enums.GranularityEnum.M5:
                        return audUsdM5Topic;
                }
                break;
        }
        throw new Error('cannot find the topic name!');
    }
}
exports.StrategyService = StrategyService;

//# sourceMappingURL=strategy.service.js.map
