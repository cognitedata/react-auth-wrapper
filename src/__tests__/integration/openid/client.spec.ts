// Copyright 2022 Cognite AS
import * as nock from 'nock';

import clientMock from '../../__mocks__/client.mock';
import issuerMock from '../../__mocks__/issuer.mock';
import Client from '../../../core/openid/client';
import { IDeviceResponse, IToken } from '../../../interfaces/client';

describe('Testing core/openid/client.ts', () => {
    const mockUrl = `${issuerMock.issuers[0].url}/${issuerMock.issuers[0].tenant_id}/oauth2/authorize?response_type=code&client_id=testing_client_id`;
    const client: Client = new Client({
        client_id: issuerMock.issuers[0].client_id,
        client_secret: issuerMock.issuers[0].client_secret,
        grant_type: issuerMock.issuers[0].grant_type,
        authority: `${issuerMock.issuers[0].url}/${issuerMock.issuers[0].tenant_id}`,
        scope: issuerMock.issuers[0].scope,
    });

    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
        nock.cleanAll();
    });

    test('should return authorization url when call client.authorizationUrl()', async () => {
        expect.assertions(3);

        const authUrl = await client.authorizationUrl({
            response_type: 'code',
            client_id: 'testing_client_id',
        });

        expect(authUrl).toBeDefined();
        expect(typeof authUrl).toBe('string');
        expect(authUrl).toEqual(mockUrl);
    });

    test('should return empty when call client.authorizationUrl()', async () => {
        expect.assertions(3);

        const authUrl = await client.authorizationUrl();

        expect(authUrl).toBeDefined();
        expect(authUrl).toBe('');
        expect(typeof authUrl).toBe('string');
    });

    test('should return authorization IToken object when call client.grant() with grant_type', async () => {
        expect.assertions(3);

        const token = await client.grant({
            grant_type: issuerMock.issuers[0].grant_type,
        });

        expect(token).toBeDefined();
        expect(token.access_token).toBeDefined();
        expect(token).toMatchObject({} as IToken);
    });

    test('should return authorization IToken object when call client.grant() with grant_type = device_code', async () => {
        expect.assertions(3);

        const token = await client.grant({
            grant_type: issuerMock.issuers[0].grant_type,
        });

        expect(token).toBeDefined();
        expect(token.access_token).toBeDefined();
        expect(token).toMatchObject({} as IToken);
    });

    test('should return authorization IToken object when call client.grant() with grant_type = device_code withou client_secret', async () => {
        expect.assertions(3);

        const anotherClient: Client = new Client({
            client_id: issuerMock.issuers[0].client_id,
            grant_type: issuerMock.issuers[0].grant_type,
            authority: `${issuerMock.issuers[0].url}/${issuerMock.issuers[0].tenant_id}`,
            scope: issuerMock.issuers[0].scope,
        });

        // Mocking authorize URL call for discover step
        nock(issuerMock.issuers[0].url)
            .get(
                `/${issuerMock.issuers[0].tenant_id}/${issuerMock.issuers[0].paths.config}`
            )
            .reply(200, {
                token_endpoint: '/oauth2/token',
            });

        // Mocking Token URL call
        nock(issuerMock.issuers[0].url)
            .post(`/${issuerMock.issuers[0].tenant_id}/oauth2/token`)
            .reply(200, clientMock.token);

        const token = await anotherClient.grant({
            grant_type: issuerMock.issuers[0].grant_type,
        });

        expect(token).toBeDefined();
        expect(token.access_token).toBeDefined();
        expect(token).toMatchObject({} as IToken);
    });

    test('should return authorization IToken object when call client.deviceAuthorization()', async () => {
        expect.assertions(7);

        const device = await client.deviceAuthorization();

        expect(device).toBeDefined();
        expect(device.expires_in).toBeDefined();
        expect(device.device_code).toBeDefined();
        expect(device.interval).toBeDefined();
        expect(device.user_code).toBeDefined();
        expect(device.verification_uri).toBeDefined();
        expect(device).toMatchObject({} as IDeviceResponse);
    });

    test('should return authorization testing string when call client.poll()', async () => {
        expect.assertions(3);
        let counter = 0;

        const promise = await client.poll<Promise<string>>(
            async () => {
                counter += 1;
                return new Promise((resolve, reject) => {
                    if (counter === 1) reject();
                    resolve('testing');
                });
            },
            1000,
            1000
        );

        expect(promise).toBeDefined();
        expect(promise).toBe('testing');
        expect(typeof promise).toBe('string');
    });

    test('should return throw error when call client.poll()', async () => {
        expect.assertions(1);
        let counter = 0;

        const throwThis = async () => {
            await client.poll<Promise<string>>(
                async () => {
                    counter += 1;
                    return new Promise((resolve, reject) => {
                        if (counter > 3) resolve('testing');
                        reject(Error('testing'));
                    });
                },
                1,
                1000
            );
        };

        await expect(throwThis).rejects.toThrow('testing');
    });

    test('should return authorization IToken object when call client.grant() with grant_type = device_code with nock', async () => {
        expect.assertions(3);

        // Mocking authorize URL call for discover step
        nock(issuerMock.issuers[0].url)
            .get(
                `/${issuerMock.issuers[0].tenant_id}/${issuerMock.issuers[0].paths.config}`
            )
            .reply(200, {
                token_endpoint: '/oauth2/token',
            });

        // Mocking Token URL call
        nock(issuerMock.issuers[0].url)
            .post(`/${issuerMock.issuers[0].tenant_id}/oauth2/token`)
            .reply(200, clientMock.token);

        const token = await client.grant({
            grant_type: 'device_code',
            code_verifier: 'testing',
            code: 'testing',
            device_code: 'testing',
        });

        expect(token).toBeDefined();
        expect(token.access_token).toBeDefined();
        expect(token).toMatchObject({} as IToken);
    });

    test('should return authorization IToken object when call client.deviceAuthorization() with nock', async () => {
        expect.assertions(7);

        // Mocking wellknow URL call for discover deviceAuthorization
        nock(issuerMock.issuers[0].url)
            .get(
                `/${issuerMock.issuers[0].tenant_id}/${issuerMock.issuers[0].paths.config}`
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
                expires_in: 123,
                device_code: '1234',
                interval: 5,
            });

        const device = await client.deviceAuthorization();

        expect(device).toBeDefined();
        expect(device.expires_in).toBeDefined();
        expect(device.device_code).toBeDefined();
        expect(device.interval).toBeDefined();
        expect(device.user_code).toBeDefined();
        expect(device.verification_uri).toBeDefined();
        expect(device).toMatchObject({} as IDeviceResponse);
    });
});
