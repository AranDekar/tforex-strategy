import * as api from '../../../../api';

export class ProxyBaseService {
    protected basePath = '';
    protected defaultHeaders: any = {};
    protected _useQuerystring: boolean = false;

    protected authentications = {
        'default': <api.Authentication>new api.VoidAuthService(),
        'api_key': new api.ApiKeyAuthService('header', 'api-key'),
    };

    constructor(basePath?: string);
    constructor(basePathOrUsername: string, password?: string, basePath?: string) {
        if (password) {
            if (basePath) {
                this.basePath = basePath;
            }
        } else {
            if (basePathOrUsername) {
                this.basePath = basePathOrUsername;
            }
        }
    }

    protected set useQuerystring(value: boolean) {
        this._useQuerystring = value;
    }

    protected setApiKey(key: api.DefaultApiKeysEnum, value: string) {
        this.authentications[api.DefaultApiKeysEnum[key]].apiKey = value;
    }

    protected extendObj<T1, T2 extends T1>(objA: T1 & T2, objB: T2): T1 & T2 {
        for (let key in objB) {
            if (objB.hasOwnProperty(key)) {
                objA[key] = objB[key];
            }
        }
        return objA;
    }
}