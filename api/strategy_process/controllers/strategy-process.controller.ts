
export async function test(req, res, next) {
    let body = req.body;
    if (!body) {
        throw new Error('body is undefined');
    }
    try {

        let strategyService = new api.StrategyService();
        let strategies = await strategyService.get(body.strategy);
        if (!strategies || strategies.length === 0) {
            throw new Error('the instrument cannot be found!');
        }
        let strategy = strategies[0];

        if (strategy.instruments.indexOf(body.instrument) === -1) {
            strategy.instruments.push(body.instrument);
            await strategy.save();
        }

        let service = new api.CandleSyncService();
        service.instrument = body.instrument;
        service.granularity = body.granularity;

        await service.sync();

        res.json('candles are being synced');
    } catch (err) {
        res.statusCode = 500; // internal server error
        next(err);
    }