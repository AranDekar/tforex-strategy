import { InstrumentEventEnum } from '../enums';

export interface InstrumentEvent {
    event: string;
    eventTime: Date;
    candleTime: Date;
    candleBid: number;
    candleAsk: number;
    isDispatched: boolean;
    payload: any;
}