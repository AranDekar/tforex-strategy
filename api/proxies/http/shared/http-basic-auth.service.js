"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpBasicAuthService {
    applyToRequest(requestOptions) {
        requestOptions.auth = {
            username: this.username,
            password: this.password,
        };
    }
}
exports.HttpBasicAuthService = HttpBasicAuthService;
//# sourceMappingURL=http-basic-auth.service.js.map