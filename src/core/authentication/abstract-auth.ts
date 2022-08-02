// Copyright 2022 Cognite AS
import type { User } from "oidc-client-ts";

import type { IAuth } from "./auth-types";
import type { CogAuthContextProps } from "./CogAuthContextProps";

abstract class AbstractAuth implements IAuth {
    constructor(protected authContext: CogAuthContextProps) {}

    /**
   * Login by selected method.
   * @param refresh_token? string
   * @returns Promise<AuthResponse>
   */
    abstract login(refresh_token?: string): Promise<User>;
}

export default AbstractAuth;
