// Copyright 2022 Cognite AS
import * as nock from 'nock';

import issuerMock from '../__mocks__/issuer.mock';
import { IWellKnow } from '../../interfaces/issuer';
import Request from '../../providers/request';

describe('Testing providers/request.ts', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    test('should return 200 and validate issuer field', async () => {
        expect.assertions(2);
        const { data: wellknowResponse, status } = await Request.init(
            `${issuerMock.issuers[0].url}/${issuerMock.issuers[0].tenant_id}`,
        ).request<unknown, IWellKnow>(
            'GET',
            issuerMock.issuers[0].paths.config,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        expect(wellknowResponse.issuer).toBeDefined();
        expect(status).toBe(200);
    });

    test('should return 200 and validate issuer field without params', async () => {
        expect.assertions(2);
        const { data: wellknowResponse, status } = await Request.init(
            `${issuerMock.issuers[0].url}/${issuerMock.issuers[0].tenant_id}`,
        ).request<unknown, IWellKnow>(
            'GET',
            issuerMock.issuers[0].paths.config,
        );

        expect(wellknowResponse.issuer).toBeDefined();
        expect(status).toBe(200);
    });

    test('should return status === 200 and validate issuer field without params but with data', async () => {
        expect.assertions(2);
        const { status } = await Request.init(
            `${issuerMock.issuers[0].url}/${issuerMock.issuers[0].tenant_id}`,
        ).request<unknown, IWellKnow>(
            'POST',
            issuerMock.issuers[0].paths.config,
            {},
            { testing: 123 },
        );

        expect(status).toBeDefined();
        expect(status === 200).toBeTruthy();
    });
});
