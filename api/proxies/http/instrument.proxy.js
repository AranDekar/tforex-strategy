"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const api = require("../../../api");
const proxies = require("../../proxies");
class InstrumentProxy extends proxies.BaseProxy {
    constructor() {
        super(api.shared.Config.settings.instruments_base_path);
    }
    /**
         * gets the LAST candle of an instrument by granularity
         * @param instrument the instrument of the candles
         * @param granularity the granularity in which the candles are fetched
         * @param topic the candles will be published into this topic
         */
    getCandles(instrument, granularity, topic) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/{instrument}/candles/{granularity}/publish/{topic}'
                .replace('{' + 'instrument' + '}', String(instrument))
                .replace('{' + 'granularity' + '}', String(granularity))
                .replace('{' + 'topic' + '}', String(topic));
            let queryParameters = {};
            let headerParams = Object.assign({}, this.defaultHeaders);
            let formParams = {};
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
            let requestOptions = {
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
                    requestOptions.formData = formParams;
                }
                else {
                    requestOptions.form = formParams;
                }
            }
            return new Promise((resolve, reject) => {
                request(requestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        if (response.statusCode >= 200 && response.statusCode <= 299) {
                            resolve({ response: response, body: body });
                        }
                        else {
                            reject({ response: response, body: body });
                        }
                    }
                });
            });
        });
    }
}
exports.InstrumentProxy = InstrumentProxy;
//# sourceMappingURL=instrument.proxy.js.map