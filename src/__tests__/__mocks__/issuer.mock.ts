// Copyright 2022 Cognite AS
export default {
    issuers: [
        {
            url: process.env.COGNITE_AUTHORITY,
            tenant_id: process.env.COGNITE_AZURE_TENANT_ID,
            client_id: process.env.COGNITE_CLIENT_ID,
            client_secret: process.env.COGNITE_CLIENT_SECRET,
            scope: process.env.COGNITE_SCOPE,
            grant_type: process.env.COGNITE_GRANT_TYPE,
            paths: {
                config: '.well-known/openid-configuration',
            },
        },
    ],
};
