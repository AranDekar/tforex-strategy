"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RaisingCandles {
    constructor() {
        this._raisingCount = 0;
        this._idleCount = 0;
        this._inTradeStatus = 'out';
    }
    get snapshotPayload() {
        return this._snapshotPayload;
    }
    replay(snapshot, events) {
        if (snapshot) {
            this._lastRaisingCandle = snapshot.payload.lastRaisingCandle;
            this._raisingCount = snapshot.payload.raisingCount;
            this._inTradeStatus = snapshot.payload.inTradeStatus;
            this._idleCount = snapshot.payload.idleCount;
        }
        for (let event of events) {
            // the event is in the channel and we are replaying it to get the latest status
            if (event.event === 'up' || event.event === 'long') {
                this._raisingCount++;
                this._idleCount = 0;
                if (event.event === 'long') {
                    this._inTradeStatus = "long";
                }
            }
            else if (event.event === 'down' || event.event === 'short') {
                this._raisingCount++;
                this._idleCount = 0;
                if (event.event === 'short') {
                    this._inTradeStatus = "short";
                }
            }
            else if (event.event === 'change' || event.event === 'out') {
                this._raisingCount = 0;
                this._idleCount = 0;
                this._inTradeStatus = "out";
            }
            else if (event.event === 'idle') {
                this._idleCount++;
            }
            this._lastRaisingCandle = event.payload;
            this._time = event.time;
        }
        if (events.length >= 10) {
            return {
                payload: {
                    lastRaisingCandle: this._lastRaisingCandle,
                    raisingCount: this._raisingCount,
                    inTradeStatus: this._inTradeStatus,
                    idleCount: this._idleCount
                },
                time: this._time,
            };
        }
        return null;
    }
    processCandle(candle) {
        let result = { event: '', payload: null };
        return new Promise((resolve, reject) => {
            // the new candle is processed here and if necessary a new event is generated/returned
            let payload, event;
            let calcVariance = (value) => { return Number(value.toFixed(5)); };
            if (!this._lastRaisingCandle) {
                const variance = calcVariance(candle.closeBid - candle.openBid);
                if (variance === 0) {
                    result = { event: `idle`, payload: null };
                }
                else if (variance > 0) {
                    this._lastRaisingCandle = {
                        variance,
                        open: candle.openBid,
                        close: candle.closeBid,
                    };
                    result = { event: `up`, payload: this._lastRaisingCandle };
                }
                else {
                    this._lastRaisingCandle = {
                        variance,
                        open: candle.openBid,
                        close: candle.closeBid,
                    };
                    result = { event: `down`, payload: this._lastRaisingCandle };
                }
            }
            else {
                if (this._lastRaisingCandle.variance > 0) {
                    let variance = calcVariance(candle.closeBid - this._lastRaisingCandle.close);
                    if (variance === 0) {
                        result = { event: `idle`, payload: this._lastRaisingCandle };
                    }
                    else if (variance > 0) {
                        this._lastRaisingCandle = {
                            variance,
                            open: this._lastRaisingCandle.close,
                            close: candle.closeBid,
                        };
                        if (this._raisingCount === 2) {
                            result = { event: `long`, payload: this._lastRaisingCandle };
                        }
                        else {
                            result = { event: `up`, payload: this._lastRaisingCandle };
                        }
                    }
                    else {
                        variance = calcVariance(candle.closeBid - this._lastRaisingCandle.open);
                        if (variance >= -0.00004) {
                            // candle is closed within the range of the last raising candle
                            // so this is nothing to pay attention to
                            result = { event: `idle`, payload: this._lastRaisingCandle };
                        }
                        else {
                            // this is changing the trend (up to down)
                            this._lastRaisingCandle = {
                                variance,
                                open: this._lastRaisingCandle.open,
                                close: candle.closeBid,
                            };
                            if (this._inTradeStatus !== 'out') {
                                result = { event: `out`, payload: this._lastRaisingCandle };
                            }
                            else {
                                result = { event: `change`, payload: this._lastRaisingCandle };
                            }
                        }
                    }
                }
                else {
                    let variance = calcVariance(candle.closeBid - this._lastRaisingCandle.close);
                    if (variance === 0) {
                        result = { event: `idle`, payload: this._lastRaisingCandle };
                    }
                    else if (variance < 0) {
                        this._lastRaisingCandle = {
                            variance,
                            open: this._lastRaisingCandle.close,
                            close: candle.closeBid,
                        };
                        if (this._raisingCount === 2) {
                            result = { event: `short`, payload: this._lastRaisingCandle };
                        }
                        else {
                            result = { event: `down`, payload: this._lastRaisingCandle };
                        }
                    }
                    else {
                        variance = calcVariance(candle.closeBid - this._lastRaisingCandle.open);
                        if (variance <= 0.00004) {
                            // candle is closed within the range of the last raising candle
                            // so this is nothing to pay attention to
                            result = { event: `idle`, payload: this._lastRaisingCandle };
                        }
                        else {
                            // this is changing the trend (up to down)
                            this._lastRaisingCandle = {
                                variance,
                                open: this._lastRaisingCandle.open,
                                close: candle.closeBid,
                            };
                            if (this._inTradeStatus !== 'out') {
                                result = { event: `out`, payload: this._lastRaisingCandle };
                            }
                            else {
                                result = { event: `change`, payload: this._lastRaisingCandle };
                            }
                        }
                    }
                }
            }
            resolve(result);
        });
    }
}
exports.RaisingCandles = RaisingCandles;
//# sourceMappingURL=raising-candles.js.map