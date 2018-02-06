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
const api = require("api");
class StrategyBacktestProducerProxy {
    constructor(topic) {
        this.topic = topic;
    }
    publish(events) {
        return __awaiter(this, void 0, void 0, function* () {
            let dispatched;
            if (events) {
                dispatched = events;
            }
            else {
                dispatched = yield api.models.strategyBacktestEventModel.findUndispatchedBacktestEvents(this.topic);
            }
            if (dispatched.length === 0) {
                console.log('no backtest event to publish!');
                // resolve(0);
            }
            const client = new kafka.KafkaClient({
                kafkaHost: api.shared.Config.settings.kafka_conn_string,
            });
            this.producer = new kafka.Producer(client);
            this.producer.on('ready', () => {
                let payload;
                console.log('NUMBER OF DISPATCHED', dispatched.length);
                for (const item of dispatched) {
                    payload = { topic: this.topic, messages: JSON.stringify(item) };
                    this.producer.send([payload], (err, data) => __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            item.isDispatched = true;
                            if (!events) {
                                item.save();
                            }
                        }
                    }));
                }
                console.log('ALL DISPATCHED');
            });
            this.producer.on('error', (err) => {
                console.log(err);
            });
        });
    }
}
exports.StrategyBacktestProducerProxy = StrategyBacktestProducerProxy;
//# sourceMappingURL=strategy-backtest-producer.proxy.js.map