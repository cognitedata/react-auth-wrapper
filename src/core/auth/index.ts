// Copyright 2022 Cognite AS
import { AuthMethod, AuthResponse, IAuth } from 'interfaces/auth';
import { ISettings } from 'interfaces/common';

import ClientCredentialsAuth from './client_credentials';
import DeviceAuth from './device';
import ImplicitAuth from './implicit';
import PkceAuth from './pkce';

// Copyright 2022 Cognite AS
class AuthWrapper implements IAuth {
    protected method: AuthMethod;
    protected settings: ISettings;

    constructor(method: AuthMethod, settings: ISettings) {
        this.method = method;
        this.settings = settings;
    }

    /**
     * Return an instance of AuthWrapper class.
     * @param method AuthMethod
     * @param settings ISettings
     * @returns new AuthWrapper
     */
    static load(method: AuthMethod, settings: ISettings) {
        return new this(method, settings);
    }

    /**
     * Login by selected method and return access_token.
     * @params refresh_token string
     * @returns Promise<AuthResponse>
     */
    async login(refresh_token?: string): Promise<AuthResponse> {
        if (!this.settings || !this.method) return;

        if (this.method === 'client_credentials') {
            return ClientCredentialsAuth.load(this.settings).login();
        }

        if (this.method === 'device') {
            return DeviceAuth.load(this.settings).login(refresh_token);
        }

        if (this.method === 'implicit') {
            return ImplicitAuth.load(this.settings).login();
        }

        if (this.method === 'pkce') {
            return PkceAuth.load(this.settings).login(refresh_token);
        }
    }
}

export default AuthWrapper;
