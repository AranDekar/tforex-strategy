import * as api from '../../api';

export async function postRevision(req, res, next) {
    const strategyRevision: api.models.StrategyRevision = req.swagger.params.revision.value;
    try {
        const service = new api.services.StrategyService();
        const data = await service.addRevision(strategyRevision);
        res.status(200).send(data);
    } catch (err) {
        res.statusCode = 400; // bad request
        res.json({ message: err.message });
    }
}

export async function putRevision(req, res, next) {
    const strategyRevision: api.models.StrategyRevisionDocument = req.swagger.params.revision.value;
    const id = req.swagger.params.id.value;
    try {
        const service = new api.services.StrategyService();
        const data = await service.updateRevision(id, strategyRevision);
        res.status(200).send(data);
    } catch (err) {
        res.statusCode = 400; // bad request
        res.json({ message: err.message });
    }
}
