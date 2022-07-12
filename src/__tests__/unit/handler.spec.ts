// Copyright 2022 Cognite AS
import ErrorHandler from '../../core/errors/handler';

describe('Testing error handling functions', () => {
    const errorString = 'handling error test';
    const errorCode = 400;

    test('expect return error calling Handler', () => {
        expect.assertions(1);
        expect(() => {
            throw new ErrorHandler(errorString, errorCode);
        }).toThrowError(errorString);
    });

    test('expect return error message when call ErrorHandler.getMessage()', () => {
        expect.assertions(1);
        expect(new ErrorHandler(errorString, errorCode).getMessage()).toBe(
            errorString,
        );
    });

    test('expect return error status_code when call ErrorHandler.getStatusCode()', () => {
        expect.assertions(1);
        expect(
            new ErrorHandler(errorString, errorCode).getStatusCode(),
        ).toEqual(400);
    });

    test('expect return error other errors when call ErrorHandler.getErrors()', () => {
        expect.assertions(1);
        expect(
            new ErrorHandler(errorString, errorCode)
                .setErrors([errorString])
                .getErrors()
                .toString(),
        ).toBe(errorString);
    });

    test('expect return error other errors when call ErrorHandler.getErrors()', () => {
        expect.assertions(1);
        expect(
            new ErrorHandler(
                // @ts-ignore
                { name: 'test', message: 'testing' },
                errorCode,
            )
                .setErrors([{ name: 'test', message: 'testing' }])
                .getErrors().length,
        ).toBe(1);
    });

    test('expect return message format does not supported when call ErrorHandler', () => {
        expect.assertions(1);
        expect(() => {
            // @ts-ignore
            throw new ErrorHandler(Number(30), errorCode);
        }).toThrow('message format does not supported');
    });

    test('expect return message format does not supported when call ErrorHandler', () => {
        // @ts-ignore
        const error = new ErrorHandler(Number(30), errorCode);

        expect(String(error)).toBe('Error: message format does not supported');
        expect.assertions(1);
    });

    test('expect return message format does not supported when call ErrorHandler.extractMessage', () => {
        // @ts-ignore
        const error = new ErrorHandler(Number(30), errorCode).extractMessage(
            Number(30),
        );

        expect(String(error)).toBe('message format does not supported');
        expect.assertions(1);
    });
});
