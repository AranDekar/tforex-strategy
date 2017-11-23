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
class StrategyBacktestConsumerProxy {
    constructor(_topicName) {
        this._topicName = _topicName;
    }
    createTopic() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
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
        }));
    }
    // public retrieveEventsFromOffset(offset): Promise<api.models.StrategyEventDocument[]> {
    //     let events: api.models.StrategyEventDocument[] = [];
    //     return new Promise((resolve, reject) => {
    //         let client = new kafka.KafkaClient({
    //             kafkaHost: api.shared.Config.settings.kafka_conn_string,
    //         });
    //         let offsetHandler = new kafka.Offset(client);
    //         let self = this;
    //         let lastOffset;
    //         offsetHandler.fetchLatestOffsets([this._topicName], (error, offsets) => {
    //             if (error && error.message === "Topic(s) does not exist") {
    //                 return resolve([]);
    //             } else if (error) {
    //                 return reject(error);
    //             }
    //             let partition = 0;
    //             console.log(offsets[this._topicName][partition]);
    //             lastOffset = offsets[this._topicName][partition];
    //             let consumer = new kafka.Consumer(
    //                 client, [
    //                     { topic: this._topicName, offset: offset },
    //                 ], {
    //                     autoCommit: true,
    //                     fromOffset: true,
    //                 },
    //             );
    //             consumer.on('message', (message: any) => {
    //                 if (message && message.value) {
    //                     let item = JSON.parse(message.value);
    //                     events.push(item);
    //                     if (events.length === lastOffset) {
    //                         resolve(events);
    //                     }
    //                 }
    //             });
    //             consumer.on('error', (err: string) => {
    //                 console.log(err);
    //                 reject(err);
    //             });
    //         });
    //     });
    // }
    subscribe() {
        return new rx.Observable(x => {
            let client = new kafka.KafkaClient({
                kafkaHost: api.shared.Config.settings.kafka_conn_string,
            });
            let consumer = new kafka.Consumer(client, [
                { topic: this._topicName, offset: 0 },
            ], {
                autoCommit: true,
                fromOffset: true,
            });
            consumer.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                if (message && message.value) {
                    let item = JSON.parse(message.value);
                    x.next(item);
                }
            }));
            consumer.on('error', (err) => {
                console.log(err);
                x.error(err);
            });
        });
    }
}
exports.StrategyBacktestConsumerProxy = StrategyBacktestConsumerProxy;
//# sourceMappingURL=strategy-backtest-consumer.proxy.js.map