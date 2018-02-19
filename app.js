require('module-alias/register');
let swaggerExpressMw = require('swagger-express-mw');
let app = require('express')();
let cors = require('cors');
let api = require('./api');
module.exports = app; // for testing
let corsOptions = {
    credentials: true,
    origin: '*',
};
let config = {
    appRoot: __dirname,
    swaggerSecurityHandlers: {
        api_key(req, authOrSecDef, scopesOrApiKey, cb) {
            console.log('in apiKeySecurity (req: ' + JSON.stringify(req.headers) + ', def: ' +
                JSON.stringify(authOrSecDef) + ', scopes: ' + scopesOrApiKey + ')');
            // your security code
            if (api.shared.Config.settings.api_key === scopesOrApiKey) {
                cb();
            }
            else {
                cb(new Error('access denied!'));
            }
        },
    },
};
swaggerExpressMw.create(config, (err, swaggerExpress) => {
    if (err) {
        throw err;
    }
    app.use(cors(corsOptions));
    swaggerExpress.register(app);
    const port = process.env.PORT || 10030;
    app.use((req, res, next) => {
        next();
    });
    app.listen(port);
    if (swaggerExpress.runner.swagger.paths['/hello']) {
        console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
    }
});
//# sourceMappingURL=app.js.map