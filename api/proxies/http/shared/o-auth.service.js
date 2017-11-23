"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OAuthService {
    applyToRequest(requestOptions) {
        if (requestOptions.headers) {
            requestOptions.headers["Authorization"] = "Bearer " + this.accessToken;
        }
    }
}
exports.OAuthService = OAuthService;
//# sourceMappingURL=o-auth.service.js.map