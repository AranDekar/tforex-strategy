"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("../../../../api");
class ApiKeyAuthService {
    constructor(location, paramName) {
        this.location = location;
        this.paramName = paramName;
        this.apiKey = api.shared.Config.settings.api_key;
    }
    applyToRequest(requestOptions) {
        if (this.location === "query") {
            requestOptions.qs[this.paramName] = this.apiKey;
        }
        else if (this.location === "header" && requestOptions.headers) {
            requestOptions.headers[this.paramName] = this.apiKey;
        }
    }
}
exports.ApiKeyAuthService = ApiKeyAuthService;

//# sourceMappingURL=api-key-auth.service.js.map
