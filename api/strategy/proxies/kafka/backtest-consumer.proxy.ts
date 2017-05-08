import * as kafka from 'kafka-node';
import * as rx from 'rxjs';

import * as api from '../../../../api';

export class BacktestConsumerProxy {
    private _consumer: kafka.Consumer;
    private _onNewCandleReceived$: rx.BehaviorSubject<api.Candle>;

    public get onNewCandleReceived$() {
        return this._onNewCandleReceived$.asObservable();
    }

    constructor() {
        this._onNewCandleReceived$ = <rx.BehaviorSubject<api.Candle>>new rx.BehaviorSubject({});
    }

    public backtest(topic: string) {
        let client = new kafka.Client(
            api.Config.settings.kafka_conn_string,
            api.Config.settings.candle_history_client_id);
        this._consumer = new kafka.Consumer(
            client, [
                { topic: topic },
            ], {
                autoCommit: true,
                groupId: api.Config.settings.candle_history_client_id,
            }
        );

        // if you don't see any message coming, it may be because you have deleted the topic and the offset 
        // is not reset with this client id.
        this._consumer.on('message', async (message: any) => {
            if (message && message.value) {
                let item = JSON.parse(message.value);
                if (item.event) {
                    this._onNewCandleReceived$.next(item.event);
                }
            }
        });
        this._consumer.on('error', (err: string) => {
            console.log(err);
        });
    }
}