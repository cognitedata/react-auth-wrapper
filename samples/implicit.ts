// Copyright 2022 Cognite AS
import { CogniteAuthWrapper } from '../src/index';

class ImplicitAuthSample {
    async load() {
        // Retrieving access_token.
        const result = await CogniteAuthWrapper.load('implicit', {
            authority: process.env.COGNITE_AUTHORITY,
            client_id: process.env.COGNITE_CLIENT_ID,
            scope: process.env.COGNITE_SCOPE,
        }).login();

        console.log(result);
    }
}

export default new ImplicitAuthSample().load();
