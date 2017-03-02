import * as request from 'request';

import * as api from '../../../../api';

export class ApiKeyAuthService implements api.Authentication {
    public apiKey: string;

    constructor(private location: string, private paramName: string) {
        this.apiKey = api.Config.settings.api_key;
    }

    public applyToRequest(requestOptions: request.Options): void {
        if (this.location === "query") {
            (<any>requestOptions.qs)[this.paramName] = this.apiKey;
        } else if (this.location === "header" && requestOptions.headers) {
            requestOptions.headers[this.paramName] = this.apiKey;
        }
    }
}