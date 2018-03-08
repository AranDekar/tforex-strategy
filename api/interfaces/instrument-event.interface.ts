import { InstrumentEventEnum } from '../enums';

export interface InstrumentEvent {
    event: InstrumentEventEnum;
    eventTime: Date;
    candleTime: Date;
    candleBid: number;
    candleAsk: number;
    payload: any;
}