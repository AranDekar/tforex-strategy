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
const rx = require("rxjs");
const api = require("../../../api");
class InstrumentGranularityTopicConsumerProxy {
    constructor(_topicName, _groupId) {
        this._topicName = _topicName;
        this._groupId = _groupId;
    }
    subscribe() {
        return new rx.Observable(x => {
            let client = new kafka.KafkaClient({
                kafkaHost: api.shared.Config.settings.kafka_conn_string,
            });
            this._consumer = new kafka.Consumer(client, [
                { topic: this._topicName },
            ], {
                autoCommit: true,
                groupId: this._groupId,
            });
            // if you don't see any message coming, it may be because you have deleted the topic and the offset
            // is not reset with this client id.
            this._consumer.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                if (message && message.value) {
                    let item = JSON.parse(message.value);
                    if (item.event) {
                        x.next(item.event);
                    }
                }
            }));
            this._consumer.on('error', (err) => {
                console.log(err);
                x.error(err);
            });
        });
    }
}
exports.InstrumentGranularityTopicConsumerProxy = InstrumentGranularityTopicConsumerProxy;

//# sourceMappingURL=instrument-granularity-topic-consumer.proxy.js.map
