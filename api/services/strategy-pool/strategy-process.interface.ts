import * as api from 'api';

export interface StrategyProcess {
    execute: (
        payload: any, instrumentEvent: api.interfaces.InstrumentEvent,
        exit: () => void, buy: () => void, sell: () => void) => Promise<any>;
}