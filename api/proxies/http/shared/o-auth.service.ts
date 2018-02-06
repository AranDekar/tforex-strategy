/**
 * adds Authorization to the header
 */

import * as request from 'request';

import * as api from 'api';

export class OAuthService implements api.proxies.Authentication {
    public accessToken: string;

    public applyToRequest(requestOptions: request.Options): void {
        if (requestOptions.headers) {
            requestOptions.headers.Authorization = 'Bearer ' + this.accessToken;
        }
    }
}