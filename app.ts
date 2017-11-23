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
    appRoot: __dirname, // required config
    swaggerSecurityHandlers: {
        api_key: function (req, authOrSecDef, scopesOrApiKey, cb) {
            console.log('in apiKeySecurity (req: ' + JSON.stringify(req.headers) + ', def: ' +
                JSON.stringify(authOrSecDef) + ', scopes: ' + scopesOrApiKey + ')');

            // your security code
            if (api.shared.Config.settings.api_key === scopesOrApiKey) {
                cb();
            } else {
                cb(new Error('access denied!'));
            }
        },
    },
};


swaggerExpressMw.create(config, function (err, swaggerExpress) {
    if (err) { throw err; }

    app.use(cors(corsOptions));
    swaggerExpress.register(app);

    let port = process.env.PORT || 3000;

    app.use(function (req, res, next) {
        next();
    });

    app.listen(port);

    if (swaggerExpress.runner.swagger.paths['/hello']) {
        console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
    }
});
