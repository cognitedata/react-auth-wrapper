// Copyright 2022 Cognite AS
import { useAuth } from "react-oidc-context";

import type { CogAuthContextProps } from "./CogAuthContextProps";

/**
 * @public
 */
export const useCogAuth = (): CogAuthContextProps => {
    const context = useAuth();

    if (!context) {
        throw new Error(
            "AuthProvider context is undefined, please verify you are calling useAuth() as child of a <AuthProvider> component.",
        );
    }

    return context;
};
