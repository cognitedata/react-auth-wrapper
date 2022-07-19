/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { NativeExtensionMethod } from "../../utils/BrowserConstants";
import { StringDict } from "@azure/msal-common";

/**
 * Token request which native broker will use to acquire tokens
 */
export type NativeTokenRequest = {
    accountId: string; // WAM specific account id used for identification of WAM account. This can be any broker-id eventually
    clientId: string;
    authority: string;
    redirectUri: string;
    scopes: string;
    correlationId: string;
    windowTitleSubstring: string; // The name of the document title. This helps the native prompt properly "parent" to the window making the request
    prompt?: string;
    nonce?: string;
    claims?: string;
    state?: string;
    reqCnf?: string;
    keyId?: string;
    tokenType?: string;
    shrClaims?: string;
    shrNonce?: string;
    resourceRequestMethod?: string;
    resourceRequestUri?: string;
    extendedExpiryToken?: boolean;
    extraParameters?: StringDict;
};

/**
 * Request which will be forwarded to native broker by the browser extension
 */
export type NativeExtensionRequestBody = {
    method: NativeExtensionMethod;
    request?: NativeTokenRequest;
};

/**
 * Browser extension request
 */
export type NativeExtensionRequest = {
    channel: string;
    responseId: number;
    extensionId?: string;
    body: NativeExtensionRequestBody
};
