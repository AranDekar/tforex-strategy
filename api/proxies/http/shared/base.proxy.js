"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("../../../../api");
class BaseProxy {
    constructor(basePathOrUsername, password, basePath) {
        this.basePath = '';
        this.defaultHeaders = {};
        this._useQuerystring = false;
        this.authentications = {
            'default': new api.proxies.VoidAuthService(),
            'api_key': new api.proxies.ApiKeyAuthService('header', 'api-key'),
        };
        if (password) {
            if (basePath) {
                this.basePath = basePath;
            }
        }
        else {
            if (basePathOrUsername) {
                this.basePath = basePathOrUsername;
            }
        }
    }
    set useQuerystring(value) {
        this._useQuerystring = value;
    }
    setApiKey(key, value) {
        this.authentications[api.proxies.DefaultApiKeysEnum[key]].apiKey = value;
    }
    extendObj(objA, objB) {
        for (let key in objB) {
            if (objB.hasOwnProperty(key)) {
                objA[key] = objB[key];
            }
        }
        return objA;
    }
}
exports.BaseProxy = BaseProxy;
//# sourceMappingURL=base.proxy.js.map