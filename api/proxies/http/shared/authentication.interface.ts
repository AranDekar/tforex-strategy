/**
 * Authentication interface
 */
import * as request from 'request';

export interface Authentication {
    applyToRequest(requestOptions: request.Options): void;
}
