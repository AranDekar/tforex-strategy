
export interface Candle {
    closeAsk: number;
    closeBid: number;
    complete: boolean;
    highAsk: number;
    highBid: number;
    lowAsk: number;
    lowBid: number;
    openAsk: number;
    openBid: number;
    time: string;
    volume: number;
}