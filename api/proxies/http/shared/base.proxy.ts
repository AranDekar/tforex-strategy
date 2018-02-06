import * as api from 'api';

export class BaseProxy {
    protected basePath = '';
    protected defaultHeaders: any = {};
    protected useQuerystring = false;

    protected authentications = {
        default: new api.proxies.VoidAuthService() as api.proxies.Authentication,
        api_key: new api.proxies.ApiKeyAuthService('header', 'api-key'),
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

    protected set UseQuerystring(value: boolean) {
        this.useQuerystring = value;
    }

    protected setApiKey(key: api.proxies.DefaultApiKeysEnum, value: string) {
        this.authentications[api.proxies.DefaultApiKeysEnum[key]].apiKey = value;
    }

    protected extendObj<T1, T2 extends T1>(objA: T1 & T2, objB: T2): T1 & T2 {
        for (const key in objB) {
            if (objB.hasOwnProperty(key)) {
                objA[key] = objB[key];
            }
        }
        return objA;
    }
}