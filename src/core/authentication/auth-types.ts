// Copyright 2022 Cognite AS
import type { User } from "oidc-client-ts";

import type { AuthError } from "./common";
import type { IToken } from "./credentials-types";

type AuthResponse = IToken | AuthError | undefined;

interface IAuth {
    login: () => Promise<User>;
}

type AuthMethod = "pkce";

export type { AuthResponse, AuthError, AuthMethod, IAuth };
