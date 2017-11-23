import * as mongoose from 'mongoose';
import * as kafka from 'kafka-node';

import * as api from '../../../api';

export class StrategyBacktestProducerProxy {
    private _producer: kafka.Producer;

    constructor(private _topic: string) {
    }

    public async publish() {
        return new Promise(async (resolve, reject) => {
            let dispatched = await api.models.strategyBacktestEventModel.findUndispatchedBacktestEvents(this._topic);

            if (dispatched.length === 0) {
                console.log('no backtest event to publish!');
                // resolve(0);
            }

            let client = new kafka.KafkaClient({
                kafkaHost: api.shared.Config.settings.kafka_conn_string,
            });

            this._producer = new kafka.Producer(client);

            this._producer.on('ready', () => {
                let payloads: any[] = [];
                for (let item of dispatched) {
                    payloads.push({ topic: this._topic, messages: JSON.stringify(item) });
                }
                this._producer.send(payloads, async (err, data) => {
                    if (err) {
                        console.log(err);
                        // reject(err);
                    } else {
                        for (let item of dispatched) {
                            item.isDispatched = true;
                            // await item.save();
                            item.save();
                        }
                        resolve(dispatched.length);
                    }
                });
            });

            this._producer.on('error', (err) => {
                console.log(err);
                reject(err);
            });
        });
    }
}