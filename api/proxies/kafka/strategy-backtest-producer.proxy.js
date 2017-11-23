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
const kafka = require("kafka-node");
const api = require("../../../api");
class StrategyBacktestProducerProxy {
    constructor(_topic) {
        this._topic = _topic;
    }
    publish() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let dispatched = yield api.models.strategyBacktestEventModel.findUndispatchedBacktestEvents(this._topic);
                if (dispatched.length === 0) {
                    console.log('no backtest event to publish!');
                    // resolve(0);
                }
                let client = new kafka.KafkaClient({
                    kafkaHost: api.shared.Config.settings.kafka_conn_string,
                });
                this._producer = new kafka.Producer(client);
                this._producer.on('ready', () => {
                    let payloads = [];
                    for (let item of dispatched) {
                        payloads.push({ topic: this._topic, messages: JSON.stringify(item) });
                    }
                    this._producer.send(payloads, (err, data) => __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            console.log(err);
                            // reject(err);
                        }
                        else {
                            for (let item of dispatched) {
                                item.isDispatched = true;
                                // await item.save();
                                item.save();
                            }
                            resolve(dispatched.length);
                        }
                    }));
                });
                this._producer.on('error', (err) => {
                    console.log(err);
                    reject(err);
                });
            }));
        });
    }
}
exports.StrategyBacktestProducerProxy = StrategyBacktestProducerProxy;
//# sourceMappingURL=strategy-backtest-producer.proxy.js.map