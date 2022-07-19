/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { NodeCacheTestUtils } from "../../../e2eTestUtils/NodeCacheTestUtils";
import { validateCacheLocation } from "../../testUtils";
import { ConfidentialClientApplication } from "../../../../lib/msal-node/";

const TEST_CACHE_LOCATION = `${__dirname}/data/aad-agc.cache.json`;

const getClientCredentialsToken = require("../index");

const cachePlugin = require("../../cachePlugin.js")(TEST_CACHE_LOCATION);

const authOptions = {
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    authority: `${process.env.AUTHORITY}/${process.env.AZURE_TENANT_ID}`,
    knownAuthorities: [`${process.env.AUTHORITY}/${process.env.AZURE_TENANT_ID}`],
};

const clientCredentialRequestScopes = [`${process.env.GRAPH_URL}/.default`];

describe('Client Credentials AAD AGC Tests', () => {
    jest.retryTimes(1);
    jest.setTimeout(90000);

    beforeAll(async () => {
        await validateCacheLocation(TEST_CACHE_LOCATION);
    });
    
    describe("Acquire Token", () => {
        let confidentialClientApplication: ConfidentialClientApplication;
        let server: any;

        beforeAll(async () => {
            await NodeCacheTestUtils.resetCache(TEST_CACHE_LOCATION);
        });

        afterEach(async () => {
            await NodeCacheTestUtils.resetCache(TEST_CACHE_LOCATION);
        });

        afterAll(async () => {
            if (server) await server.close()
        })

        it("Performs acquire token", async () => {
            confidentialClientApplication = new ConfidentialClientApplication({ auth: authOptions, cache: { cachePlugin }});
            server = await getClientCredentialsToken(confidentialClientApplication, clientCredentialRequestScopes);
            const cachedTokens = await NodeCacheTestUtils.getTokens(TEST_CACHE_LOCATION);
            expect(cachedTokens.accessTokens.length).toBe(1);
        });

        it("Performs acquire token through regional authorities", async () => {
            confidentialClientApplication = new ConfidentialClientApplication({ auth: authOptions, cache: { cachePlugin }});
            server = await getClientCredentialsToken(confidentialClientApplication, clientCredentialRequestScopes, { region: "usseceast" });
            const cachedTokens = await NodeCacheTestUtils.getTokens(TEST_CACHE_LOCATION);
            expect(cachedTokens.accessTokens.length).toBe(1);
        });
    });
});