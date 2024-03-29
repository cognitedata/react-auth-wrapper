// Copyright 2022 Cognite AS
import type { AuthMethod } from "../../auth-types";
import type AuthCredentials from "../AuthCredentials";
import type { CogAuthContextProps } from "../CogAuthContextProps";
import PkceAuth from "../../pkce";

export class ReactAuthWrapperProvider {
    private constructor(
        public method: AuthMethod,
        public authContext: CogAuthContextProps,
        public tokenInspectUrl: string,
    ) {}

    public static load(authMethod: AuthMethod, authContext: CogAuthContextProps, tokenInspectUrl: string) {
        return new this(authMethod, authContext, tokenInspectUrl);
    }

    async login(refresh_token?: string): Promise<AuthCredentials | unknown> {
        if (this.method === "pkce") {
            return await PkceAuth.load(this.authContext).login(refresh_token);
        }

        throw new Error("unsuported authentication method");
    }

    public static requires(credentials: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!credentials.method) {
            console.log("Credentials does not specify a method");
            throw Error(
                "credentials.method is required and must be of type string with one of this values: pkce",
            );
        }

        console.log("Checks have passed!");
    }
}
