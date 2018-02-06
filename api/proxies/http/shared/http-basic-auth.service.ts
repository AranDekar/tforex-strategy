import * as request from 'request';

import * as api from 'api';

export class HttpBasicAuthService implements api.proxies.Authentication {
    public username: string;
    public password: string;
    public applyToRequest(requestOptions: request.Options): void {
        requestOptions.auth = {
            username: this.username,
            password: this.password,
        };
    }
}
