"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = (context, event, exit, buy, sell) => {
    const toPips = (pips) => Number((pips * 100000).toFixed(5));
    if (event.name === 'h4_sma_changed') {
        if (event.context.period === 20) {
            context.sma = event.context.result;
            let doBuy = false;
            let diff = toPips(context.sma - event.bidPrice);
            if (diff < 0) {
                diff = toPips(event.askPrice - context.sma);
                doBuy = true;
            }
            context.diff = diff;
            if (diff < 100) {
                exit();
            }
            if (diff > 250) {
                if (doBuy) {
                    buy();
                }
                else {
                    sell();
                }
            }
        }
    }
};
//# sourceMappingURL=h4-sma.js.map