import * as kafka from 'kafka-node';
import * as rx from 'rxjs';

import * as api from '../../../api';

export class CandleConsumerProxy {
    private _consumer: kafka.Consumer;
    private _producer: kafka.Producer;

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
    public subscribe() {
        return new rx.Observable<api.interfaces.Candle>(x => {
            let client = new kafka.KafkaClient({
                kafkaHost: api.shared.Config.settings.kafka_conn_string,
            });
            this._consumer = new kafka.Consumer(
                client, [
                    { topic: this._topicName, offset: 0 },
                ], {
                    autoCommit: true,
                    fromOffset: true,
                },
            );

            // if you don't see any message coming, it may be because you have deleted the topic and the offset
            // is not reset with this client id.
            this._consumer.on('message', async (message: any) => {
                if (message && message.value) {
                    let item = JSON.parse(message.value);
                    x.next(item);
                }
            });
            this._consumer.on('error', (err: string) => {
                console.log(err);
                x.error(err);
            });
        });
    }
}