// Copyright 2022 Cognite AS
import * as open from 'open';

import { errorHandling, nonce } from '../../helper';
import { AuthResponse } from '../../interfaces/auth';
import { ISettings } from '../../interfaces/common';
import { CALLBACK_URL } from '../../utils/utils.json';
import { listenForAuthCode, openServerAtPort } from '../http/server';
import Client from '../openid/client';
import Auth from './auth';

class ClientCredentialsAuth extends Auth {
    protected settings: ISettings;

    /**
     * @param settings ISettings
     */
    constructor(settings: ISettings) {
        super(settings);
    }

    /**
     * Return an instance of ClientCredentials class.
     * @param settings ISettings
     * @returns new ClientCredentialsAuth
     */
    static load(settings: ISettings) {
        return new this(settings);
    }

    /**
     * Login by Client Credentials method and return access_token.
     * @returns Promise<AuthResponse>
     */
    async login(): Promise<AuthResponse> {
        const { app, server } = await openServerAtPort();
        try {
            const client = new Client(this.settings);

            if (
                this.settings.grant_type &&
                this.settings.grant_type === 'authorization_code'
            ) {
                const authUrl = await client.authorizationUrl({
                    client_id: this.settings.client_id,
                    scope: this.settings.scope,
                    response_type: 'code',
                    redirect_uri: CALLBACK_URL,
                    nonce,
                });

                await open(authUrl);

                const { code } = await listenForAuthCode('get', app);

                const grantResponse = await client.grant({
                    grant_type: this.settings.grant_type,
                    code,
                });

                return grantResponse;
            }

            const grantResponse = await client.grant({
                grant_type: this.settings.grant_type,
            });

            return grantResponse;
        } catch (err: unknown) {
            return errorHandling(err);
        } finally {
            server.close();
        }
    }
}

export default ClientCredentialsAuth;
