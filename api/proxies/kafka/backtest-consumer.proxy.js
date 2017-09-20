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
class BacktestConsumerProxy {
    get onNewCandleReceived$() {
        return this._onNewCandleReceived$.asObservable();
    }
    constructor() {
        this._onNewCandleReceived$ = new rx.BehaviorSubject({});
    }
    backtest(topic) {
        let client = new kafka.Client(api.Config.settings.kafka_conn_string, api.Config.settings.candle_history_client_id);
        this._consumer = new kafka.Consumer(client, [
            { topic: topic },
        ], {
            autoCommit: true,
            groupId: api.Config.settings.candle_history_client_id,
        });
        // if you don't see any message coming, it may be because you have deleted the topic and the offset
        // is not reset with this client id.
        this._consumer.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            if (message && message.value) {
                let item = JSON.parse(message.value);
                if (item.event) {
                    this._onNewCandleReceived$.next(item.event);
                }
            }
        }));
        this._consumer.on('error', (err) => {
            console.log(err);
        });
    }
}
exports.BacktestConsumerProxy = BacktestConsumerProxy;

//# sourceMappingURL=backtest-consumer.proxy.js.map
