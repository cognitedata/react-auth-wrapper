// Copyright 2022 Cognite AS
import * as open from 'open';

import { errorHandling, deviceField } from '../../helper';
import { AuthResponse } from '../../interfaces/auth';
import { IToken } from '../../interfaces/client';
import { ISettings } from '../../interfaces/common';
import Client from '../openid/client';
import Auth from './auth';

class DeviceAuth extends Auth {
    protected settings: ISettings;

    /**
     * @param settings ISettings
     */
    constructor(settings: ISettings) {
        super(settings);
    }

    /**
     * Return an instance of DeviceAuth class.
     * @param settings ISettings
     * @returns new DeviceAuth
     */
    static load(settings: ISettings) {
        return new this(settings);
    }

    /**
     * Login by Device method and return access_token.
     * @param refresh_token? string
     * @returns Promise<AuthResponse>
     */
    async login(refresh_token?: string): Promise<AuthResponse> {
        if (!refresh_token) {
            try {
                this.settings.scope = `${this.settings.scope} offline_access`;
                const client = new Client(this.settings);

                const verificationCode = await client.deviceAuthorization();

                console.log('User Code: ', verificationCode.user_code);
                console.log(
                    'Verification URI: ',
                    verificationCode.verification_uri
                );
                console.log('--');

                await open(verificationCode.verification_uri);

                const params = {
                    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                    client_id: this.settings.client_id,
                    ...(this.settings.client_secret
                        ? { client_secret: this.settings.client_secret }
                        : {}),
                };

                params[deviceField(this.settings.authority)] =
                    verificationCode.device_code;

                const grantResponse = await client.poll<Promise<IToken>>(
                    async () => client.grant(params),
                    1000,
                    1000
                );

                return grantResponse;
            } catch (err: unknown) {
                return errorHandling(err);
            }
        }

        try {
            const client = new Client(this.settings);

            const grantResponse = await client.grant({
                grant_type: 'refresh_token',
                refresh_token,
            });

            return grantResponse;
        } catch (err: unknown) {
            return errorHandling(err);
        }
    }
}

export default DeviceAuth;
