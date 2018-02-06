import * as http from 'http';
import * as request from 'request';

import * as api from '../../../api';
import * as proxies from '../../proxies';

export class InstrumentProxy extends proxies.BaseProxy {
    constructor() {
        super(api.shared.Config.settings.instruments_base_path);
    }
    /**
         * gets the LAST candle of an instrument by granularity
         * @param instrument the instrument of the candles
         * @param granularity the granularity in which the candles are fetched
         * @param topic the candles will be published into this topic
         */
    public async getCandles(instrument: string, granularity: string, topic: string):
        Promise<{
            response: http.ClientResponse; body: { 'count': number; }
            ;
        }> {
        const localVarPath = this.basePath + '/{instrument}/candles/{granularity}/publish/{topic}'
            .replace('{' + 'instrument' + '}', String(instrument))
            .replace('{' + 'granularity' + '}', String(granularity))
            .replace('{' + 'topic' + '}', String(topic));
        let queryParameters: any = {};
        let headerParams: any = (<any>Object).assign({}, this.defaultHeaders);
        let formParams: any = {};


        // verify required parameter 'instrument' is not null or undefined
        if (instrument === null || instrument === undefined) {
            throw new Error('Required parameter instrument was null or undefined when calling getCandles.');
        }

        // verify required parameter 'granularity' is not null or undefined
        if (granularity === null || granularity === undefined) {
            throw new Error('Required parameter granularity was null or undefined when calling getCandles.');
        }

        // verify required parameter 'topic' is not null or undefined
        if (topic === null || topic === undefined) {
            throw new Error('Required parameter topic was null or undefined when calling getCandles.');
        }

        let useFormData = false;

        let requestOptions: request.Options = {
            method: 'GET',
            qs: queryParameters,
            headers: headerParams,
            uri: localVarPath,
            useQuerystring: this.useQuerystring,
            json: true,
        };

        this.authentications.api_key.applyToRequest(requestOptions);

        this.authentications.default.applyToRequest(requestOptions);

        if (Object.keys(formParams).length) {
            if (useFormData) {
                (<any>requestOptions).formData = formParams;
            } else {
                requestOptions.form = formParams;
            }
        }
        return new Promise<{ response: http.ClientResponse; body: { 'count': number; }; }>((resolve, reject) => {
            request(requestOptions, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        resolve({ response: response, body: body });
                    } else {
                        reject({ response: response, body: body });
                    }
                }
            });
        });
    }
}
