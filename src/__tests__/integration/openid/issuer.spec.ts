// Copyright 2022 Cognite AS
import * as nock from 'nock';

import issuerMock from '../../__mocks__/issuer.mock';
import Issuer from '../../../core/openid/issuer';

describe('Testing core/openid/issuer.ts', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    test('should return valid issuer response', async () => {
        expect.assertions(3);
        const issuer = Issuer.init(
            `${issuerMock.issuers[0].url}/${issuerMock.issuers[0].tenant_id}`,
        );
        const issuerResponse = await issuer.discover();

        expect(issuerResponse.issuer).toBeDefined();
        expect(issuerResponse.token_endpoint).toBeDefined();
        expect(issuerResponse.authorization_endpoint).toBeDefined();
    });
});
