// Copyright 2022 Cognite AS
import { CogniteAuthWrapper } from '../src/index';

class ClientCredentialsSample {
    async load() {
        // Retrieving access_token.
        const result = await CogniteAuthWrapper.load('client_credentials', {
            authority: process.env.COGNITE_AUTHORITY,
            client_id: process.env.COGNITE_CLIENT_ID,
            grant_type: process.env.COGNITE_GRANT_TYPE || '',
            client_secret: process.env.COGNITE_CLIENT_SECRET || '',
            scope: process.env.COGNITE_SCOPE,
        }).login();

        console.log(result);
    }
}

export default new ClientCredentialsSample().load();
