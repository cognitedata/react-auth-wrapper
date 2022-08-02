import type { User } from "oidc-client-ts";
import type { AuthMethod } from "../../auth-types";
import type { CogAuthContextProps } from "../../CogAuthContextProps";
export declare class ReactAuthWrapperProvider {
    method: AuthMethod;
    authContext: CogAuthContextProps;
    private constructor();
    static load(authMethod: AuthMethod, authContext: CogAuthContextProps): ReactAuthWrapperProvider;
    login(refresh_token?: string): Promise<User | unknown>;
    static requires(credentials: any): void;
}
//# sourceMappingURL=ReactAuthWrapperProvider.d.ts.map