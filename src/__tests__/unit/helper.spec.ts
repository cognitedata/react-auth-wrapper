// Copyright 2022 Cognite AS
import { DISCOVER, INVALID } from '../../core/openid/endpoints.json';
import {
    abort,
    abortIf,
    codeChallenge,
    codeVerifier,
    deviceField,
    errorHandling,
    nonce,
    random,
    state,
} from '../../helper';
import base64 from '../../utils/base64';

describe('Testing helper.ts', () => {
    describe('Testing deviceField()', () => {
        test('should return code, cause issuer is micosoft', () => {
            expect.assertions(2);
            expect(deviceField('https://login.microsoftonline.com/')).toBe(
                'code',
            );
        });

        test('should return device_code, cause issuer is !== microsoft', () => {
            expect.assertions(1);
            expect(deviceField('another_issuer')).toBe('device_code');
        });
    });

    describe('Testing errorHandling()', () => {
        const errorDescriptionMock = {
            response: {
                status: 409,
                data: {
                    error: '[test]',
                    error_description: 'Custom error just for test.',
                },
            },
        };

        const errorStatusMock = {
            response: {
                data: '',
                status: 404,
            },
        };

        test('should return issuer_problems error object', () => {
            expect.assertions(1);
            expect(errorHandling(errorStatusMock)).toEqual({
                error: DISCOVER.error_response,
            });
        });

        test('should return issuer_problems error object cause code ECONNREFUSED', () => {
            expect.assertions(1);
            expect(
                errorHandling({ ...errorStatusMock, code: 'ECONNREFUSED' }),
            ).toEqual({
                error: {
                    type: INVALID.error_response.type,
                    value: INVALID.error_response.value,
                },
            });
        });

        test('should return [test] Custom error just for test error object', () => {
            expect.assertions(1);
            expect(errorHandling(errorDescriptionMock)).toEqual({
                error: {
                    type: '[test]',
                    value: 'Custom error just for test.',
                },
            });
        });

        test('should call abort() when call errorHandling()', () => {
            expect.assertions(1);
            expect(() => errorHandling(new Error('testing'))).toThrow('');
        });
    });

    describe('Testing random and base64 functions', () => {
        test('should return string calling codeChallenge()', () => {
            expect.assertions(1);
            expect(typeof codeChallenge(codeVerifier)).toBe('string');
        });

        test('should return string calling codeVerifier()', () => {
            expect.assertions(1);
            expect(typeof codeVerifier).toBe('string');
        });

        test('should return string calling random()', () => {
            expect.assertions(1);
            expect(typeof random()).toBe('string');
        });

        test('should return string calling nonce()', () => {
            expect.assertions(1);
            expect(typeof nonce).toBe('string');
        });

        test('should return string calling state()', () => {
            expect.assertions(1);
            expect(typeof state).toBe('string');
        });

        test('should return string calling base64.fromBase64()', () => {
            expect.assertions(1);
            expect(
                typeof base64.fromBase64(
                    Buffer.from('testing').toString('base64'),
                ),
            ).toBe('string');
        });

        test('should encode and decode a string with encode() and decode() functions', () => {
            expect.assertions(4);

            const originalString = 'testing';
            const encodedString = base64.encode(originalString);
            const decodedString = base64.decode(encodedString);

            expect(typeof encodedString).toBe('string');
            expect(
                String(originalString) === String(encodedString),
            ).toBeFalsy();
            expect(String(encodedString) === String(decodedString)).toBeFalsy();
            expect(
                String(originalString) === String(decodedString),
            ).toBeTruthy();
        });
    });

    describe('Testing Errorhandler calling abort and abortIf', () => {
        test('should be name and message define when call abort()', () => {
            expect.assertions(1);
            expect(() => abort('testing', 409)).toThrow('');
        });

        test('should be name and message define when call abort()', () => {
            expect.assertions(1);
            expect(() => abortIf(true, 'testing', 409)).toThrow();
        });

        test('should be name and message define when call abort()', () => {
            expect.assertions(1);
            expect(abortIf(false, 'testing', 409)).toBe(undefined);
        });
    });

    describe('should return []', () => {
        expect.assertions(1);

        expect(() => errorHandling(Number(3001))).toThrow(Array);
    });
});
