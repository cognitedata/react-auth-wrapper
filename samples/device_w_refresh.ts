// Copyright 2022 Cognite AS
import { CogniteAuthWrapper } from '../src/index';

class DeviceSample {
    protected settings = {
        authority: process.env.COGNITE_AUTHORITY,
        client_id: process.env.COGNITE_CLIENT_ID,
        scope: process.env.COGNITE_SCOPE,
    };

    async load() {
        const method = 'device';

        // Retrieving access_token.
        const tokenResponse = await CogniteAuthWrapper.load(
            method,
            this.settings,
        ).login();

        // Retrieving token with previous refresh_token
        const refreshedTokenResponse = await CogniteAuthWrapper.load(
            method,
            this.settings,
            // @ts-ignore
        ).login(tokenResponse?.refresh_token);

        console.log(refreshedTokenResponse);
    }
}

export default new DeviceSample().load();
