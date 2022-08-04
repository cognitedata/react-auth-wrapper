// Copyright 2022 Cognite AS
import type { User } from "oidc-client-ts";

import AbstractAuth from "./abstract-auth";
import type { AuthResponse } from "./auth-types";
import type { CogAuthContextProps } from "./wrapper/CogAuthContextProps";

class PkceAuth extends AbstractAuth {
    authResponse: AuthResponse;

    constructor(protected authContext: CogAuthContextProps) {
        super(authContext);
    }

    /**
   * Return an instance of PkceAuth class.
   * @returns new PkceAuth
   */
    static load(authContext: CogAuthContextProps) {
        return new this(authContext);
    }

    /**
   * Login by PKCE method and return access_token.
   * @param refresh_token? string
   * @returns Promise<AuthResponse>
   */
    async login(refresh_token?: string): Promise<User> {
        let user;

        if (!refresh_token) {
            console.log("token is being obtained");
            user = this.authContext.user;
        } else {
            console.log("token is being refreshed");
            user = await this.authContext.signinSilent();
        }

        if (!user) {
            throw new Error("Authentication did not return a user");
        }

        return user;
    }
}

export default PkceAuth;
