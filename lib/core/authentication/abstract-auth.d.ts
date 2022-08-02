import type { User } from "oidc-client-ts";
import type { IAuth } from "./auth-types";
import type { CogAuthContextProps } from "./CogAuthContextProps";
declare abstract class AbstractAuth implements IAuth {
    protected authContext: CogAuthContextProps;
    constructor(authContext: CogAuthContextProps);
    /**
   * Login by selected method.
   * @param refresh_token? string
   * @returns Promise<AuthResponse>
   */
    abstract login(refresh_token?: string): Promise<User>;
}
export default AbstractAuth;
//# sourceMappingURL=abstract-auth.d.ts.map