// Copyright 2022 Cognite AS
import * as qs from 'qs';

import {
    IClient,
    IAuthorizationParameters,
    IToken,
    IGrantBody,
    IDeviceResponse,
} from '../../interfaces/client';
import { ISettings } from '../../interfaces/common';
import Request from '../../providers/request';
import { CALLBACK_URL } from '../../utils/utils.json';
import Issuer from './issuer';

class Client implements IClient {
    protected issuer: Issuer;

    constructor(protected settings: ISettings) {
        this.issuer = Issuer.init(this.settings.authority);
    }

    /**
     * Generate and return an authorization Url.
     * @param parameters IAuthorizationParameters
     * @returns Promise<string>
     */
    async authorizationUrl(
        parameters?: IAuthorizationParameters,
    ): Promise<string> {
        if (!parameters) return '';

        const issuerResponse = await this.issuer.discover();

        return `${issuerResponse.authorization_endpoint}?${qs.stringify(
            parameters,
        )}`;
    }

    /**
     * Grant access and return token.
     * @param body IGrantBody
     * @returns Promise<IToken>
     */
    async grant(body: IGrantBody): Promise<IToken> {
        const issuerResponse = await this.issuer.discover();

        const { data: tokenResponse } = await Request.init(
            this.settings.authority,
        ).request<string, IToken>(
            'POST',
            issuerResponse.token_endpoint,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
            qs.stringify({
                grant_type: body.grant_type,
                client_id: this.settings.client_id,
                scope: this.settings.scope,
                ...(!body.grant_type.includes('device_code')
                    ? { redirect_uri: CALLBACK_URL }
                    : {}),
                ...(body.refresh_token
                    ? { refresh_token: body.refresh_token }
                    : {}),
                ...(body.code_verifier
                    ? { code_verifier: body.code_verifier }
                    : {}),
                ...(body.code ? { code: body.code } : {}),
                ...(body.device_code ? { device_code: body.device_code } : {}),
                ...(this.settings.client_secret
                    ? { client_secret: this.settings.client_secret }
                    : {}),
            }),
        );

        return tokenResponse;
    }

    /**
     * Return device code and verification url.
     * @returns Promise<IDeviceResponse>
     */
    async deviceAuthorization(): Promise<IDeviceResponse> {
        const issuerResponse = await this.issuer.discover();

        const { data: codeResponse } = await Request.init(
            this.settings.authority,
        ).request<unknown, IDeviceResponse>(
            'POST',
            issuerResponse.device_authorization_endpoint,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
            qs.stringify({
                client_id: this.settings.client_id,
                scope: this.settings.scope,
            }),
        );

        if (codeResponse.verification_url)
            codeResponse.verification_uri = codeResponse.verification_url;

        return codeResponse;
    }

    /**
     * Run the passed function with retries.
     * @param fn function
     * @param retries number
     * @param timeoutBetweenAttempts number
     * @returns T
     */
    async poll<T = any>(
        fn: () => T,
        retries = Infinity,
        timeoutBetweenAttempts = 5000,
    ): Promise<T> {
        // eslint-disable-next-line no-promise-executor-return
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        return Promise.resolve()
            .then(fn)
            .catch(function retry(err) {
                // eslint-disable-next-line no-param-reassign, no-plusplus
                if (retries-- > 0)
                    return delay(timeoutBetweenAttempts).then(fn).catch(retry);
                throw err;
            });
    }
}

export default Client;
