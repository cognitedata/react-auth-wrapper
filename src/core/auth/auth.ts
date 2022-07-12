// Copyright 2022 Cognite AS
import { AuthResponse, IAuth } from '../../interfaces/auth';
import { ISettings } from '../../interfaces/common';

abstract class Auth implements IAuth {
    /**
     * @param settings ISettings
     */
    constructor(protected settings: ISettings) {}

    /**
     * Login by selected method.
     * @param refresh_token? string
     * @returns Promise<AuthResponse>
     */
    abstract login(refresh_token?: string): Promise<AuthResponse>;
}

export default Auth;
