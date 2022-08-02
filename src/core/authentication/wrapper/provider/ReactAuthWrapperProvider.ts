// Copyright 2022 Cognite AS

import type { User } from "oidc-client-ts";
import type { AuthMethod } from "../../auth-types";
import type { CogAuthContextProps } from "../../CogAuthContextProps";
import PkceAuth from "../../pkce";

export class ReactAuthWrapperProvider {
    private constructor(
        public method: AuthMethod,
        public authContext: CogAuthContextProps,
    ) {}

    public static load(authMethod: AuthMethod, authContext: CogAuthContextProps) {
        return new this(authMethod, authContext);
    }

    async login(refresh_token?: string): Promise<User | unknown> {
        if (this.method === "pkce") {
            return await PkceAuth.load(this.authContext).login(refresh_token);
        }

        throw new Error("unsuported authentication method");
    }

    public static requires(credentials: any) {
        if (!credentials.method) {
            console.log("Credentials does not have a method property");
            throw Error(
                "options.credentials.method is required and must be of type string with one of this values: api, client_credentials, device, implicit, pkce",
            );
        }

        console.log("Checks have passed!");
    }
}
