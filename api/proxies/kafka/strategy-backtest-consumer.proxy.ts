import * as kafka from 'kafka-node';
import * as rx from 'rxjs';

import * as api from '../../../api';

export class StrategyBacktestConsumerProxy {

    constructor(private _topicName: string) {
    }

    public createTopic() {
        return new Promise(async (resolve, reject) => {
            let client = new kafka.KafkaClient({
                kafkaHost: api.shared.Config.settings.kafka_conn_string,
            });

            let producer = new kafka.Producer(client);
            // Create topics sync
            producer.on('ready', () => {
                producer.createTopics([this._topicName], false, function (err, data) {
                    if (err) { return reject(err); }
                    console.log(data);
                    resolve(true);
                });
            });
        });
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

    public subscribe() {
        return new rx.Observable<api.models.StrategyEventDocument>(x => {
            let client = new kafka.KafkaClient({
                kafkaHost: api.shared.Config.settings.kafka_conn_string,
            });

            let consumer = new kafka.Consumer(
                client, [
                    { topic: this._topicName, offset: 0 },
                ], {
                    autoCommit: true,
                    fromOffset: true,
                },
            );

            consumer.on('message', async (message: any) => {
                if (message && message.value) {
                    let item = JSON.parse(message.value);
                    x.next(item);
                }
            });
            consumer.on('error', (err: string) => {
                console.log(err);
                x.error(err);
            });
        });
    }
}