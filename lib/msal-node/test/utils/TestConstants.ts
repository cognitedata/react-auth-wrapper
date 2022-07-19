/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ICrypto, AuthError, PkceCodes } from "@azure/msal-common";

export const TEST_CONSTANTS = {
    APP_NAME: "MSAL Node.js Unit Test",
    APP_VERSION: "1.0.0",
    PREFERRED_CACHE: "login.windows.net",
    CLIENT_ID: "b41a6fbb-c728-4e03-aa59-d25b0fd383b6",
    DEFAULT_AUTHORITY: "https://login.microsoftonline.com/common/",
    AUTHORITY: "https://login.microsoftonline.com/TenantId",
    ALTERNATE_AUTHORITY: "https://login.microsoftonline.com/alternate",
    USGOV_AUTHORITY: "https://login.microsoftonline.us/common/",
    REDIRECT_URI: "http://localhost:8080",
    CLIENT_SECRET: "MOCK_CLIENT_SECRET",
    DEFAULT_GRAPH_SCOPE: ["user.read"],
    USERNAME: "mockuser",
    PASSWORD: "mockpassword",
    AUTHORIZATION_CODE:
        "0.ASgAqPq4kJXMDkamGO53C-4XWVm3ypmrKgtCkdhePY1PBjsoAJg.AQABAAIAAAAm-06blBE1TpVMil8KPQ41DOje1jDj1oK3KxTXGKg89VjLYJi71gx_npOoxVfC7X49MqOX7IltTJOilUId-IAHndHXlfWzoSGq3GUmwAOLMisftceBRtq3YBsvHX7giiuSZXJgpgu03uf3V2h5Z3GJNpnSXT1f7iVFuRvGh1-jqjWxKs2un8AS5rhti1ym1zxkeicKT43va5jQeHVUlTQo69llnwQJ3iKmKLDVq_Q25Au4EQjYaeEx6TP5IZSqPPm7x0bynmjE8cqR5r4ySP4wH8fjnxlLySrUEZObk2VgREB1AdH6-xKIa04EnJEj9dUgTwiFvQumkuHHetFOgH7ep_9diFOdAOQLUK8C9N4Prlj0JiOcgn6l0xYd5Q9691Ylw8UfifLwq_B7f30mMLN64_XgoBY9K9CR1L4EC1kPPwIhVv3m6xmbhXZ3efx-A-bbV2SYcO4D4ZlnQztHzie_GUlredtsdEMAOE3-jaMJs7i2yYMuIEEtRcHIjV_WscVooCDdKmVncHOObWhNUSdULAejBr3pFs0v3QO_xZ269eLu5Z0qHzCZ_EPg2aL-ERz-rpgdclQ_H_KnEtMsC4F1RgAnDjVmSRKJZZdnNLfKSX_Wd40t_nuo4kjN2cSt8QzzeL533zIZ4CxthOsC4HH2RcUZDIgHdLDLT2ukg-Osc6J9URpZP-IUpdjXg_uwbkHEjrXDMBMo2pmCqaWbMJKo5Lr7CrystifnDITXzZmmOah8HV83Xyb6EP8Gno6JRuaG80j8BKDWyb1Yof4rnLI1kZ59n_t2d0LnRBXz50PdWCWX6vtkg-kAV-bGJQr45XDSKBSv0Q_fVsdLMk24NacUZcF5ujUtqv__Bv-wATzCHWlbUDGHC8nHEi84PcYAjSsgAA",
    ACCESS_TOKEN: "ThisIsAnAccessT0ken",
    REFRESH_TOKEN: "thisIsARefreshT0ken",
    AUTH_CODE_URL:
        "https://login.microsoftonline.com/TenantId/oauth2.0/v2.0/authorize?client_id=b41a6fbb-c728-4e03-aa59-d25b0fd383b6&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%2F8080%2F&response_mode=query&scope=user.read%20openid%20profile%20offline_access",
    CACHE_LOCATION: "Test",
    CLIENT_ASSERTION: "MOCK_CLIENT_ASSERTION",
    THUMBPRINT: "6182de7d4b84517655fe0bfa97076890d66bf37a",
    PRIVATE_KEY: "PRIVATE_KEY",
    PUBLIC_CERTIFICATE:
`-----BEGIN CERTIFICATE-----
line1
line2
-----END CERTIFICATE-----

-----BEGIN CERTIFICATE-----
line3
line4
-----END CERTIFICATE-----
    `,
    CLAIMS: 'claim1 claim2',
    SNI_CERTIFICATE:
    `-----BEGIN PRIVATE KEY-----\r
line1\r
line2\r
line3\r
line4\r
line5\r
-----END PRIVATE KEY-----\r
-----BEGIN CERTIFICATE-----\r
line1\r
line2\r
line3\r
line4\r
line5\r
-----END CERTIFICATE-----\r
-----BEGIN CERTIFICATE-----\r
line1\r
line2\r
line3\r
line4\r
line5\r
-----END CERTIFICATE-----\r
-----BEGIN CERTIFICATE-----\r
line1\r
line2\r
line3\r
line4\r
line5\r
-----END CERTIFICATE-----\r
`
};

export const AUTHENTICATION_RESULT = {
    status: 200, body: {
        token_type: "Bearer",
        scope: "openid profile User.Read email",
        expires_in: 3599,
        ext_expires_in: 3599,
        access_token: "thisIs.an.accessT0ken",
        refresh_token: "thisIsARefreshT0ken",
        id_token: "thisIsAIdT0ken",
    },
};

export const DEFAULT_CRYPTO_IMPLEMENTATION: ICrypto = {
    createNewGuid: (): string => {
        const notImplErr = "Crypto interface - createNewGuid() has not been implemented";
        throw AuthError.createUnexpectedError(notImplErr);
    },
    base64Decode: (): string => {
        const notImplErr = "Crypto interface - base64Decode() has not been implemented";
        throw AuthError.createUnexpectedError(notImplErr);
    },
    base64Encode: (): string => {
        const notImplErr = "Crypto interface - base64Encode() has not been implemented";
        throw AuthError.createUnexpectedError(notImplErr);
    },
    async generatePkceCodes(): Promise<PkceCodes> {
        const notImplErr = "Crypto interface - generatePkceCodes() has not been implemented";
        throw AuthError.createUnexpectedError(notImplErr);
    },
    async getPublicKeyThumbprint(): Promise<string> {
        const notImplErr = "Crypto interface - getPublicKeyThumbprint() has not been implemented";
        throw AuthError.createUnexpectedError(notImplErr);
    },
    async removeTokenBindingKey(): Promise<boolean> {
        const notImplErr = "Crypto interface - removeTokenBindingKey() has not been implemented";
        throw AuthError.createUnexpectedError(notImplErr);
    },
    async clearKeystore(): Promise<boolean> {
        const notImplErr = "Crypto interface - clearKeystore() has not been implemented";
        throw AuthError.createUnexpectedError(notImplErr);
    },
    async signJwt(): Promise<string> {
        const notImplErr = "Crypto interface - signJwt() has not been implemented";
        throw AuthError.createUnexpectedError(notImplErr);
    },
    async hashString(): Promise<string> {
        const notImplErr = "Crypto interface - hashString() has not been implemented";
        throw AuthError.createUnexpectedError(notImplErr);
    }
};

export const DEFAULT_OPENID_CONFIG_RESPONSE = {
    body: {
        "token_endpoint": "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
        "token_endpoint_auth_methods_supported": [
            "client_secret_post",
            "private_key_jwt",
            "client_secret_basic"
        ],
        "jwks_uri": "https://login.microsoftonline.com/{tenant}/discovery/v2.0/keys",
        "response_modes_supported": [
            "query",
            "fragment",
            "form_post"
        ],
        "subject_types_supported": ["pairwise"],
        "id_token_signing_alg_values_supported": ["RS256"],
        "response_types_supported": ["code", "id_token", "code id_token", "id_token token"],
        "scopes_supported": ["openid", "profile", "email", "offline_access"],
        "issuer": "https://login.microsoftonline.com/{tenant}/v2.0",
        "request_uri_parameter_supported": false,
        "userinfo_endpoint": "https://graph.microsoft.com/oidc/userinfo",
        "authorization_endpoint": "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize",
        "http_logout_supported": true,
        "frontchannel_logout_supported": true,
        "end_session_endpoint": "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/logout",
        "claims_supported": ["sub", "iss", "cloud_instance_name", "cloud_instance_host_name", "cloud_graph_host_name", "msgraph_host", "aud", "exp", "iat", "auth_time", "acr", "nonce", "preferred_username", "name", "tid", "ver", "at_hash", "c_hash", "email"],
        "tenant_region_scope": null,
        "cloud_instance_name": "microsoftonline.com",
        "cloud_graph_host_name": "graph.windows.net",
        "msgraph_host": "graph.microsoft.com",
        "rbac_url": "https://pas.windows.net"
    }
};

export const ID_TOKEN_CLAIMS = {
    ver: "2.0",
    iss: "https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0",
    sub: "AAAAAAAAAAAAAAAAAAAAAIkzqFVrSaSaFHy782bbtaQ",
    aud: "6cb04018-a3f5-46a7-b995-940c78f5aef3",
    exp: 1536361411,
    iat: 1536274711,
    nbf: 1536274711,
    name: "Abe Lincoln",
    preferred_username: "AbeLi@microsoft.com",
    oid: "00000000-0000-0000-66f3-3332eca7ea81",
    tid: "3338040d-6c67-4c5b-b112-36a304b66dad",
    nonce: "123523",
    aio: "Df2UVXL1ix!lMCWMSOJBcFatzcGfvFGhjKv8q5g0x732dR5MB5BisvGQO7YWByjd8iQDLq!eGbIDakyp5mnOrcdqHeYSnltepQmRp6AIZ8jY"
};

// Test CLIENT_INFO
export const TEST_DATA_CLIENT_INFO = {
    TEST_UID: "123-test-uid",
    TEST_UTID: "456-test-utid",
    TEST_DECODED_CLIENT_INFO: "{\"uid\":\"123-test-uid\",\"utid\":\"456-test-utid\"}",
    TEST_INVALID_JSON_CLIENT_INFO: "{\"uid\":\"123-test-uid\"\"utid\":\"456-test-utid\"}",
    TEST_RAW_CLIENT_INFO: "eyJ1aWQiOiIxMjMtdGVzdC11aWQiLCJ1dGlkIjoiNDU2LXRlc3QtdXRpZCJ9",
    TEST_CLIENT_INFO_B64ENCODED: "eyJ1aWQiOiIxMjM0NSIsInV0aWQiOiI2Nzg5MCJ9",
    TEST_ENCODED_HOME_ACCOUNT_ID: "MTIzLXRlc3QtdWlk.NDU2LXRlc3QtdXRpZA==",
    TEST_DECODED_HOME_ACCOUNT_ID: "123-test-uid.456-test-utid",
    TEST_LOCAL_ACCOUNT_ID: "00000000-0000-0000-66f3-3332eca7ea81s",
    TEST_CACHE_RAW_CLIENT_INFO: "eyJ1aWQiOiJ1aWQiLCAidXRpZCI6InV0aWQifQ==",
    TEST_CACHE_DECODED_CLIENT_INFO: "{\"uid\":\"uid\", \"utid\":\"utid\"}",
    TEST_RAW_CLIENT_INFO_GUIDS: "eyJ1aWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtNjZmMy0zMzMyZWNhN2VhODEiLCJ1dGlkIjoiMzMzODA0MGQtNmM2Ny00YzViLWIxMTItMzZhMzA0YjY2ZGFkIn0=",
    TEST_CACHE_DECODED_CLIENT_INFO_GUIDS: "{\"uid\":\"00000000-0000-0000-66f3-3332eca7ea81\",\"utid\":\"3338040d-6c67-4c5b-b112-36a304b66dad\"}"
};

// Test Crypto Values
export const TEST_CRYPTO_VALUES = {
    TEST_SHA256_HASH: "vdluSPGh34Y-nFDCbX7CudVKZIXRG1rquljNBbn7xuE"
}