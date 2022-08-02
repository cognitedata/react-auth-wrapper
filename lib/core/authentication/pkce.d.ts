import type { User } from "oidc-client-ts";
import AbstractAuth from "./abstract-auth";
import type { AuthResponse } from "./auth-types";
import type { CogAuthContextProps } from "./CogAuthContextProps";
declare class PkceAuth extends AbstractAuth {
    protected authContext: CogAuthContextProps;
    authResponse: AuthResponse;
    constructor(authContext: CogAuthContextProps);
    /**
   * Return an instance of PkceAuth class.
   * @returns new PkceAuth
   */
    static load(authContext: CogAuthContextProps): PkceAuth;
    /**
   * Login by PKCE method and return access_token.
   * @param refresh_token? string
   * @returns Promise<AuthResponse>
   */
    login(refresh_token?: string): Promise<User>;
}
export default PkceAuth;
//# sourceMappingURL=pkce.d.ts.map