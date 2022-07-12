// Copyright 2022 Cognite AS
import * as nock from 'nock';

import clientMock from '../../__mocks__/client.mock';
import issuerMock from '../../__mocks__/issuer.mock';
import { INVALID, DISCOVER } from '../../../core/openid/endpoints.json';
import { CogniteAuthWrapper } from '../../../index';
import { ISettings } from '../../../interfaces/common';

describe('Testing core/auth/device.ts', () => {
    const method = 'device';
    const settings: ISettings = {
        authority: `${issuerMock.issuers[0].url}/${issuerMock.issuers[0].tenant_id}`,
        client_id: issuerMock.issuers[0].client_id,
        client_secret: issuerMock.issuers[0].client_secret,
        grant_type: 'client_credentials',
        scope: issuerMock.issuers[0].scope,
    };

    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
        nock.cleanAll();
    });

    test('should return access_token', async () => {
        expect.assertions(6);

        // Mocking wellknow URL call for discover deviceAuthorization
        nock(issuerMock.issuers[0].url)
            .get(
                `/${issuerMock.issuers[0].tenant_id}/${issuerMock.issuers[0].paths.config}`,
            )
            .reply(200, {
                device_authorization_endpoint: '/oauth2/devicecode',
            });

        // Mocking devicecode URL call for discover deviceAuthorization
        nock(issuerMock.issuers[0].url)
            .post(`/${issuerMock.issuers[0].tenant_id}/oauth2/devicecode`)
            .reply(200, {
                verificationCode: '1234',
                verification_uri: '',
                user_code: '4321',
            });

        // Mocking authorize URL call for discover step
        nock(issuerMock.issuers[0].url)
            .get(
                `/${issuerMock.issuers[0].tenant_id}/${issuerMock.issuers[0].paths.config}`,
            )
            .reply(200, {
                token_endpoint: '/oauth2/token',
            });

        // Mocking Token URL call
        nock(issuerMock.issuers[0].url)
            .post(`/${issuerMock.issuers[0].tenant_id}/oauth2/token`)
            .reply(200, clientMock.token);

        const grantResponse = await CogniteAuthWrapper.load(
            method,
            settings,
        ).login();
        expect(grantResponse).toHaveProperty('token_type');
        expect(grantResponse).toHaveProperty('expires_in');
        expect(grantResponse).toHaveProperty('ext_expires_in');
        expect(grantResponse).toHaveProperty('access_token');
        expect(grantResponse).toHaveProperty('refresh_token');
        expect(grantResponse).toHaveProperty('scope');
    });

    test('should return access_token without client_secret', async () => {
        expect.assertions(6);

        // Mocking wellknow URL call for discover deviceAuthorization
        nock(issuerMock.issuers[0].url)
            .get(
                `/${issuerMock.issuers[0].tenant_id}/${issuerMock.issuers[0].paths.config}`,
            )
            .reply(200, {
                device_authorization_endpoint: '/oauth2/devicecode',
            });

        // Mocking devicecode URL call for discover deviceAuthorization
        nock(issuerMock.issuers[0].url)
            .post(`/${issuerMock.issuers[0].tenant_id}/oauth2/devicecode`)
            .reply(200, {
                verificationCode: '1234',
                verification_uri: '',
                user_code: '4321',
            });

        // Mocking authorize URL call for discover step
        nock(issuerMock.issuers[0].url)
            .get(
                `/${issuerMock.issuers[0].tenant_id}/${issuerMock.issuers[0].paths.config}`,
            )
            .reply(200, {
                token_endpoint: '/oauth2/token',
            });

        // Mocking Token URL call
        nock(issuerMock.issuers[0].url)
            .post(`/${issuerMock.issuers[0].tenant_id}/oauth2/token`)
            .reply(200, clientMock.token);

        const grantResponse = await CogniteAuthWrapper.load(method, {
            ...settings,
            client_secret: '',
        }).login();

        expect(grantResponse).toHaveProperty('token_type');
        expect(grantResponse).toHaveProperty('expires_in');
        expect(grantResponse).toHaveProperty('ext_expires_in');
        expect(grantResponse).toHaveProperty('access_token');
        expect(grantResponse).toHaveProperty('refresh_token');
        expect(grantResponse).toHaveProperty('scope');
    });

    test('should throw error cause invalid uri', async () => {
        expect.assertions(1);

        expect(
            await CogniteAuthWrapper.load(method, {
                ...settings,
                authority: 'wrong_authority',
            }).login(),
        ).toMatchObject({ error: INVALID.error_response });
    });

    test('should throw error cause invalid pattern uri', async () => {
        expect.assertions(1);

        expect(
            await CogniteAuthWrapper.load(method, {
                ...settings,
                authority: 'https://google.com',
            }).login(),
        ).toMatchObject({ error: DISCOVER.error_response });
    });

    test('should throw error cause received error from well know endpoint', async () => {
        expect.assertions(1);

        // Mocking authorize URL call for discover step
        nock(issuerMock.issuers[0].url)
            .get(
                `/${issuerMock.issuers[0].tenant_id}/${issuerMock.issuers[0].paths.config}`,
            )
            .reply(400, {
                error: 'testing_error',
                error_description: 'just for testing',
            });

        expect(
            await CogniteAuthWrapper.load(method, settings).login(),
        ).toMatchObject({
            error: {
                type: 'testing_error',
                value: 'just for testing',
            },
        });
    });
});
