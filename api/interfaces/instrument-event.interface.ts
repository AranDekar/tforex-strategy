import { InstrumentEventEnum } from '../enums';

export interface InstrumentEvent {
    name: string;
    time: Date;
    candleTime: Date;
    bidPrice: number;
    askPrice: number;
    isDispatched: boolean;
    context: {};
}