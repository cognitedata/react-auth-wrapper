// Copyright 2022 Cognite AS
const fromBase64 = (base64) =>
    base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const encode = (input, encoding = 'utf8') =>
    // @ts-ignore
    fromBase64(Buffer.from(input, encoding).toString('base64'));

const decode = (input) => Buffer.from(input, 'base64');

export default { encode, decode, fromBase64 };
