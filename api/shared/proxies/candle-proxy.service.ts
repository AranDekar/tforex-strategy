import * as http from 'http';
import * as request from 'request';

import * as api from '../../../api';

export class CandleProxyService extends api.ProxyBaseService {
    constructor() {
        super(api.Config.settings.instrument_base_path);
    }

    /**
         * 
         * to backtest a strategy publishes the candles into a message channel
         * @param instrument the instrument of the candles
         * @param granularity the granularity in which the candles are fetched
         * @param topic the topic to be used for messages
         */
    public getHistoryData(instrument: string, granularity: string, topic: string):
        Promise<{ response: http.ClientResponse; body: api.EventResponse; }> {
        const localVarPath = this.basePath + '/candles/history';
        let queryParameters: any = {};
        let headerParams: any = this.extendObj({}, this.defaultHeaders);
        let formParams: any = {};


        // verify required parameter 'instrument' is not null or undefined
        if (instrument === null || instrument === undefined) {
            throw new Error('Required parameter instrument was null or undefined when calling getHistoryData.');
        }

        // verify required parameter 'granularity' is not null or undefined
        if (granularity === null || granularity === undefined) {
            throw new Error('Required parameter granularity was null or undefined when calling getHistoryData.');
        }

        // verify required parameter 'topic' is not null or undefined
        if (topic === null || topic === undefined) {
            throw new Error('Required parameter topic was null or undefined when calling getHistoryData.');
        }

        if (instrument !== undefined) {
            queryParameters['instrument'] = instrument;
        }

        if (granularity !== undefined) {
            queryParameters['granularity'] = granularity;
        }

        if (topic !== undefined) {
            queryParameters['topic'] = topic;
        }

        let useFormData = false;

        let requestOptions: request.Options = {
            method: 'GET',
            qs: queryParameters,
            headers: headerParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
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
        return new Promise<{ response: http.ClientResponse; body: api.EventResponse; }>((resolve, reject) => {
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
