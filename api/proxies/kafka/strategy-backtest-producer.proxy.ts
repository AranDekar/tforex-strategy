import * as mongoose from 'mongoose';
import * as kafka from 'kafka-node';

import * as api from 'api';
import { disconnect } from 'cluster';

export class StrategyBacktestProducerProxy {
    private producer: kafka.Producer;

    constructor(private topic: string) {
    }

    public async publish(events: api.models.StrategyEvent[] | null) {
        let dispatched;
        if (events) {
            dispatched = events;
        } else {
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
            let payload: any;
            console.log('NUMBER OF DISPATCHED', dispatched.length);
            for (const item of dispatched) {
                payload = { topic: this.topic, messages: JSON.stringify(item) };

                this.producer.send([payload], async (err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
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