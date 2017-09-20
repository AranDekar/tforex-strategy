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
const api = require("../../strategy");
class StrategyService {
    get(id = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (id) {
                return yield api.Model.strategyModel.find({ id: id }).exec();
            }
            else {
                return yield api.Model.strategyModel.find().exec();
            }
        });
    }
    create(strategy) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = new api.Model.strategyModel(strategy);
            yield model.save();
            return model;
        });
    }
    backtest(strategyId, instrument) {
        return __awaiter(this, void 0, void 0, function* () {
            let svc = new api.StrategyService();
            let strategies = yield svc.get(strategyId);
            if (!strategies || strategies.length !== 1) {
                throw new Error('strategy cannot be found!');
            }
            let strategy = strategies[0];
            let topic = strategy.name.concat(api.InstrumentEnum[instrument]);
            // listen to the messages that are to come from candle service to backtest
            let kafkaConsumer = new api.BacktestConsumerProxy();
            kafkaConsumer.onNewCandleReceived$.subscribe(candle => {
                return;
            }, err => {
                return;
            });
            kafkaConsumer.backtest(topic);
            // ask candle service to provide backtest data
            let candleProxy = new api.CandleProxy();
            yield candleProxy.getHistoryData(api.InstrumentEnum[instrument], api.GranularityEnum[strategy.granularity], topic);
            return 1;
        });
    }
    process(candle) {
        return null;
    }
}
exports.StrategyService = StrategyService;

//# sourceMappingURL=strategy.service.js.map
