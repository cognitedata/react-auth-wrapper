// Copyright 2022 Cognite AS
import * as request from 'supertest';

import { openServerAtPort, listenForAuthCode } from '../../../core/http/server';

describe('Testing core/http/server.ts', () => {
    test('should return app and server instances and match object', async () => {
        expect.assertions(2);

        const { app, server } = await openServerAtPort();

        expect(app).toBeDefined();
        expect(server.address()).toMatchObject({
            address: '0.0.0.0',
            family: 'IPv4',
            port: 59999,
        });
        return server.close();
    });

    test('should return code passing by route', async () => {
        expect.assertions(3);

        const { app, server } = await openServerAtPort();

        const promises = await Promise.allSettled([
            request(server).get('/callback').query({ code: 123 }),
            listenForAuthCode('get', app),
        ]);

        expect(app).toBeDefined();
        expect(server.address()).toMatchObject({
            address: '0.0.0.0',
            family: 'IPv4',
            port: 59999,
        });
        // @ts-ignore
        expect(promises[1].value.code).toBe('123');
        return server.close();
    });

    test('should return error when listen for callback with error object', async () => {
        expect.assertions(3);

        const { app, server } = await openServerAtPort();

        const promises = await Promise.allSettled([
            request(server)
                .get('/callback')
                .query({ error: 'testing', error_description: 'testing' }),
            listenForAuthCode('get', app),
        ]);

        expect(app).toBeDefined();
        expect(server.address()).toMatchObject({
            address: '0.0.0.0',
            family: 'IPv4',
            port: 59999,
        });
        // @ts-ignore
        expect(promises[0].value.text).toBe(
            'Something went wrong: testing, description: testing',
        );
        return server.close();
    });

    test('should return error when listen for callback without code param', async () => {
        expect.assertions(3);

        const { app, server } = await openServerAtPort();

        const promises = await Promise.allSettled([
            request(server).get('/callback'),
            listenForAuthCode('get', app),
        ]);

        expect(app).toBeDefined();
        expect(server.address()).toMatchObject({
            address: '0.0.0.0',
            family: 'IPv4',
            port: 59999,
        });
        // @ts-ignore
        expect(promises[0].value.text).toBe(
            'Well thats embarrassing, neither we got an auth code or any error {}',
        );
        return server.close();
    });
});
