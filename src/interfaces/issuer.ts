// Copyright 2022 Cognite AS
interface IWellKnow {
    authorization_endpoint: string;
    device_authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
    revocation_endpoint: string;
    jwks_uri: string;
    [key: string]: any;
}

interface IIssuer {
    discover: () => Promise<IWellKnow>;
}

export { IWellKnow, IIssuer };
