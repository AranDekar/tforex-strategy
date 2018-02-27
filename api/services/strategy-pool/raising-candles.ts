
import * as api from '../../../api';

export class RaisingCandles {
    get SnapshotPayload() {
        return this.snapshotPayload;
    }
    private snapshotPayload;

    private raisingCount = 0;
    private idleCount = 0;
    private lastRaisingCandle;
    private inTradeStatus = 'out';
    private time;

    public replay(snapshot: api.models.StrategySnapshot | null, events: api.models.StrategyEvent[]) {
        if (snapshot) {
            this.lastRaisingCandle = snapshot.payload.lastRaisingCandle;
            this.raisingCount = snapshot.payload.raisingCount;
            this.inTradeStatus = snapshot.payload.inTradeStatus;
            this.idleCount = snapshot.payload.idleCount;
        }
        for (const event of events) {
            // the event is in the channel and we are replaying it to get the latest status
            if (event.event === 'up' || event.event === 'long') {
                this.raisingCount++;
                this.idleCount = 0;

                if (event.event === 'long') {
                    this.inTradeStatus = 'long';
                }
            } else if (event.event === 'down' || event.event === 'short') {
                this.raisingCount++;
                this.idleCount = 0;

                if (event.event === 'short') {
                    this.inTradeStatus = 'short';
                }
            } else if (event.event === 'change' || event.event === 'out') {
                this.raisingCount = 0;
                this.idleCount = 0;

                this.inTradeStatus = 'out';
            } else if (event.event === 'idle') {
                this.idleCount++;
            }
            this.lastRaisingCandle = event.payload;
            this.time = event.time;
        }
        if (events.length >= 10) {
            return {
                payload: {
                    lastRaisingCandle: this.lastRaisingCandle,
                    raisingCount: this.raisingCount,
                    inTradeStatus: this.inTradeStatus,
                    idleCount: this.idleCount,
                },
                time: this.time,
            };
        }
        return null;
    }
    public processCandle(candle: api.interfaces.Candle): Promise<{ event: string, payload: any }> {
        let result: { event: string, payload: any } = { event: '', payload: null };
        return new Promise((resolve, reject) => {
            // the new candle is processed here and if necessary a new event is generated/returned
            const calcVariance = (value: number) => Number(value.toFixed(5));

            if (!this.lastRaisingCandle) {
                const variance = calcVariance(candle.closeBid - candle.openBid);

                if (variance === 0) {
                    result = { event: `idle`, payload: null };
                } else if (variance > 0) {
                    this.lastRaisingCandle = {
                        variance,
                        open: candle.openBid,
                        close: candle.closeBid,
                    };
                    result = { event: `up`, payload: this.lastRaisingCandle };
                } else {
                    this.lastRaisingCandle = {
                        variance,
                        open: candle.openBid,
                        close: candle.closeBid,
                    };
                    result = { event: `down`, payload: this.lastRaisingCandle };
                }
            } else {
                if (this.lastRaisingCandle.variance > 0) {
                    let variance = calcVariance(candle.closeBid - this.lastRaisingCandle.close);
                    if (variance === 0) {
                        result = { event: `idle`, payload: this.lastRaisingCandle };
                    } else if (variance > 0) {
                        this.lastRaisingCandle = {
                            variance,
                            open: this.lastRaisingCandle.close,
                            close: candle.closeBid,
                        };
                        if (this.raisingCount === 2) {
                            result = { event: `long`, payload: this.lastRaisingCandle };
                        } else {
                            result = { event: `up`, payload: this.lastRaisingCandle };
                        }
                    } else {
                        variance = calcVariance(candle.closeBid - this.lastRaisingCandle.open);
                        if (variance >= -0.00004) {
                            // candle is closed within the range of the last raising candle
                            // so this is nothing to pay attention to
                            result = { event: `idle`, payload: this.lastRaisingCandle };
                        } else {
                            // this is changing the trend (up to down)
                            this.lastRaisingCandle = {
                                variance,
                                open: this.lastRaisingCandle.open,
                                close: candle.closeBid,
                            };
                            if (this.inTradeStatus !== 'out') {
                                result = { event: `out`, payload: this.lastRaisingCandle };
                            } else {
                                result = { event: `change`, payload: this.lastRaisingCandle };
                            }
                        }
                    }
                } else { // last candle variance was negative so a down trending candle
                    let variance = calcVariance(candle.closeBid - this.lastRaisingCandle.close);
                    if (variance === 0) {
                        result = { event: `idle`, payload: this.lastRaisingCandle };
                    } else if (variance < 0) {
                        this.lastRaisingCandle = {
                            variance,
                            open: this.lastRaisingCandle.close,
                            close: candle.closeBid,
                        };

                        if (this.raisingCount === 2) {
                            result = { event: `short`, payload: this.lastRaisingCandle };
                        } else {
                            result = { event: `down`, payload: this.lastRaisingCandle };
                        }
                    } else {
                        variance = calcVariance(candle.closeBid - this.lastRaisingCandle.open);
                        if (variance <= 0.00004) {
                            // candle is closed within the range of the last raising candle
                            // so this is nothing to pay attention to
                            result = { event: `idle`, payload: this.lastRaisingCandle };
                        } else {
                            // this is changing the trend (up to down)
                            this.lastRaisingCandle = {
                                variance,
                                open: this.lastRaisingCandle.open,
                                close: candle.closeBid,
                            };

                            if (this.inTradeStatus !== 'out') {
                                result = { event: `out`, payload: this.lastRaisingCandle };
                            } else {
                                result = { event: `change`, payload: this.lastRaisingCandle };
                            }
                        }
                    }
                }
            }
            resolve(result);
        });
    }
}
