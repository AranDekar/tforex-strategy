import * as api from '../../api';

export async function getEvents(req, res, next) {
    const id = req.swagger.params.id.value;
    try {
        const result: api.models.Strategy[] = [];
        const service = new api.services.StrategyService();
        const data = await service.getById(id);
        if (!data) {
            res.statusCode = 404; // not found
            return res.json({ message: 'strategy not found!' });
        }
        res.json(data.events);
    } catch (err) {
        res.statusCode = 400; // bad request
        res.json({ message: err.message });
        // return next({ message: err.message });
    }
}

export async function postEvent(req, res, next) {
    const id = req.swagger.params.id.value;
    const events = req.swagger.params.events.value;
    try {
        const service = new api.services.StrategyService();
        const data = await service.setEvents(id, events);
        res.json(data);
    } catch (err) {
        res.statusCode = 400; // bad request
        res.json({ message: err.message });
        // return next({ message: err.message });
    }
}
