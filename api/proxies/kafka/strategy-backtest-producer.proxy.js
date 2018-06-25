"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafka = require("kafka-node");
const api = require("api");
class StrategyBacktestProducerProxy {
    constructor(topic) {
        this.topic = topic;
    }
    async publish(events) {
        let dispatched;
        if (events) {
            dispatched = events;
        }
        else {
            dispatched = [];
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
                this.producer.send([payload], async (err, data) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        item.isDispatched = true;
                        if (!events) {
                            item.save();
                        }
                    }
                });
            }
            console.log('ALL DISPATCHED');
        });
        this.producer.on('error', (err) => {
            console.log(err);
        });
    }
}
exports.StrategyBacktestProducerProxy = StrategyBacktestProducerProxy;
//# sourceMappingURL=strategy-backtest-producer.proxy.js.map