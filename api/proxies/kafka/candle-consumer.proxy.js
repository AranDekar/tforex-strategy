"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafka = require("kafka-node");
const rx = require("rxjs");
const api = require("../../../api");
class CandleConsumerProxy {
    constructor(_topicName) {
        this._topicName = _topicName;
    }
    createTopic() {
        return new Promise(async (resolve, reject) => {
            let client = new kafka.KafkaClient({
                kafkaHost: api.shared.Config.settings.kafka_conn_string,
            });
            let producer = new kafka.Producer(client);
            // Create topics sync
            producer.on('ready', () => {
                producer.createTopics([this._topicName], false, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    console.log(data);
                    resolve(true);
                });
            });
        });
    }
    subscribe(count) {
        return new rx.Observable(x => {
            let items = [];
            let client = new kafka.KafkaClient({
                kafkaHost: api.shared.Config.settings.kafka_conn_string,
            });
            this._consumer = new kafka.Consumer(client, [
                { topic: this._topicName, offset: 0 },
            ], {
                autoCommit: true,
                fromOffset: true,
            });
            // if you don't see any message coming, it may be because you have deleted the topic and the offset
            // is not reset with this client id.
            this._consumer.on('message', async (message) => {
                if (message && message.value) {
                    let item = JSON.parse(message.value);
                    items.push(item);
                }
                if (items.length >= count) {
                    x.next(items);
                }
            });
            this._consumer.on('error', (err) => {
                console.log(err);
                x.error(err);
            });
        });
    }
}
exports.CandleConsumerProxy = CandleConsumerProxy;
//# sourceMappingURL=candle-consumer.proxy.js.map