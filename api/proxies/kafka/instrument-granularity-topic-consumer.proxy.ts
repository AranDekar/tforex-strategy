import * as kafka from 'kafka-node';
import * as rx from 'rxjs';

import * as api from '../../../api';

export class InstrumentGranularityTopicConsumerProxy {
    private _consumer: kafka.Consumer;

    constructor(private _topicName: string, private _groupId) {
    }

    public subscribe() {
        return new rx.Observable<api.interfaces.Candle>(x => {
            let client = new kafka.KafkaClient({
                kafkaHost: api.shared.Config.settings.kafka_conn_string,
            });

            this._consumer = new kafka.Consumer(
                client, [
                    { topic: this._topicName },
                ], {
                    autoCommit: true,
                    groupId: this._groupId,
                },
            );
            // if you don't see any message coming, it may be because you have deleted the topic and the offset
            // is not reset with this client id.
            this._consumer.on('message', async (message: any) => {
                if (message && message.value) {
                    let item = JSON.parse(message.value);
                    if (item.event) {
                        x.next(item.event);
                    }
                }
            });
            this._consumer.on('error', (err: string) => {
                console.log(err);
                x.error(err);
            });
        });
    }
}