import * as request from 'request';

import * as api from '../../../../api';

export class VoidAuthService implements api.Authentication {
    public username: string;
    public password: string;
    public applyToRequest(requestOptions: request.Options): void {
        // Do nothing
    }
}
