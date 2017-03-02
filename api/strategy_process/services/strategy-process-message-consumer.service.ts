import * as kafka from 'kafka-node';

import * as api from '../../../api';

export class StrategyProcessMessageConsumerService {
    private static _consumer: kafka.Consumer;
    public static backtest(topic: string) {
        let client = new kafka.Client(
            api.Config.settings.kafka_conn_string,
            api.Config.settings.candle_history_client_id);
        StrategyProcessMessageConsumerService._consumer = new kafka.Consumer(
            client, [
                { topic: topic, partition: 0 },
            ], {
                autoCommit: true,
                groupId: api.Config.settings.candle_history_client_id,
            }
        );

        // if you don't see any message coming, it may be because you have deleted the topic and the offset 
        // is not reset with this client id.
        StrategyProcessMessageConsumerService._consumer.on('message', async (message: any) => {
            if (message && message.value) {
                let item = JSON.parse(message.value);
                if (item.event) {
                    let processService = new api.StrategyProcessService();
                    processService.process(item);
                }
            }
        });
        StrategyProcessMessageConsumerService._consumer.on('error', (err: string) => {
            console.log(err);
        });
    }
}