import type { User } from "oidc-client-ts";
import type { AuthError } from "./common";
import type { IToken } from "./credentials-types";
declare type AuthResponse = IToken | AuthError | undefined;
interface IAuth {
    login: () => Promise<User>;
}
declare type AuthMethod = "pkce";
export type { AuthResponse, AuthError, AuthMethod, IAuth };
//# sourceMappingURL=auth-types.d.ts.map