/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AuthenticationResult, AuthenticationScheme, INetworkModule, Logger } from "@azure/msal-common";
import { jwtVerify, createLocalJWKSet, createRemoteJWKSet, JWTVerifyOptions, JWTPayload } from "jose";
import { buildConfiguration, Configuration, TokenValidationConfiguration } from "../config/Configuration";
import { OpenIdConfigProvider } from "../config/OpenIdConfigProvider";
import { buildTokenValidationParameters, TokenValidationParameters, BaseValidationParameters } from "../config/TokenValidationParameters";
import { ValidationConfigurationError } from "../error/ValidationConfigurationError";
import { ValidationError } from "../error/ValidationError";
import { ExpressNextFunction, ExpressRequest, ExpressResponse } from "../request/MiddlewareTypes";
import { TokenValidationResponse } from "../response/TokenValidationResponse";
import { TokenValidationMiddlewareResponse } from "../response/TokenValidationMiddlewareResponse";
import { name, version } from "../packageMetadata";
import crypto from "crypto";
import { NodeCacheManager } from "../cache/NodeCacheManager";
import { CryptoProvider } from "../crypto/CryptoProvider";
import { Constants } from "../utils/Constants";

/**
 * The TokenValidator class is the object exposed by the library to perform token validation.
 */
export class TokenValidator {

    // Input configuration
    private config: TokenValidationConfiguration;

    // Logger object
    protected logger: Logger;

    // Network interface implementation
    protected networkInterface: INetworkModule;

    // Crypto Provider
    protected cryptoProvider: CryptoProvider;

    // Platform storage object
    protected storage: NodeCacheManager;

    // OpenIdConfig Provider implementation
    protected openIdConfigProvider: OpenIdConfigProvider;

    /**
     * Constructor for the TokenValidator class
     * @param configuration Object for the TokenValidator instance
     */
    constructor(configuration?: Configuration) {
        // Set the configuration
        this.config = buildConfiguration(configuration);

        // Initialize logger
        this.logger = new Logger(this.config.system.loggerOptions, name, version);

        // Initialize crypto provider
        this.cryptoProvider = new CryptoProvider();

        // Initialize storage
        this.storage = new NodeCacheManager(this.logger, Constants.EMPTY_STRING, this.cryptoProvider);

        // Initialize network client
        this.networkInterface = this.config.system.networkClient,

        // Initialize OpenId configuration provider
        this.openIdConfigProvider = new OpenIdConfigProvider(this.config, this.networkInterface, this.storage, this.logger);
    }

    /**
     * Middleware-style function to validate token from request.
     * @param {@link (TokenValidationParameters:type)}
     * @param resource Optional resource to retrieve access token from session 
     * @returns 
     */
    validateTokenMiddleware(options: TokenValidationParameters, resource?: string): TokenValidationMiddlewareResponse {

        return (req: ExpressRequest, _res: ExpressResponse, next: ExpressNextFunction) => {

            // Adding access token to authorization header from session
            if (resource && req.session && req.session.protectedResources) {
                if (!req.session.protectedResources[resource]) {
                    const error = ValidationConfigurationError.createMissingTokenError(`Resource ${resource} is not a protectedResource in req session. No access token to add to headers.`);
                    next(error);
                } else {
                    const token = req.session.protectedResources[resource].accessToken;
                    if (!token) {
                        const error = ValidationConfigurationError.createMissingTokenError(`No access token for resource ${resource} in session. Unable to add to request headers.`);
                        next(error);
                    }
    
                    // Attach bearer token to authorization header
                    req.headers.authorization = `Bearer ${token}`;
                }
            }

            // Validating token from request
            this.validateTokenFromRequest(req, options)
                .then(() => {
                    next();
                })
                .catch((error) => {
                    next(error);
                });
        };
    }

    /**
     * Function to validate token from request
     * @param request 
     * @param {@link (TokenValidationParameters:type)}
     * @returns {Promise.<TokenValidationResponse>}
     */
    async validateTokenFromRequest(request: ExpressRequest, options: TokenValidationParameters): Promise<TokenValidationResponse> {
        this.logger.trace("TokenValidator.validateTokenFromRequest called");

        // Validates token if found in authorization header
        if (request.headers && request.headers.authorization) {
            const [ scheme, token ] = request.headers.authorization.split(" ");
            
            // Validates token if authorization header is bearer
            if (scheme.toLowerCase() === AuthenticationScheme.BEARER.toLowerCase()) {
                this.logger.verbose("Bearer token extracted from request authorization headers");
                return this.validateToken(token, options);
            } else {
                this.logger.verbose("Request authorization headers does not include bearer token");
                // If not bearer, call CAE/EasyAuth/MISE solution here for more complex handling
            }
        } 
        
        // Validates token if found in request body
        if (request.body?.access_token) {
            this.logger.verbose("Token extracted from request body");
            return this.validateToken(request.body.access_token, options);
        }

        throw ValidationConfigurationError.createMissingTokenError("No tokens found in authorization header or body.");
    }

    /**
     * Function to validate token from msal-node token acquisition response. Returns array of token validation responses.
     * @param response 
     * @param {@link (TokenValidationParameters:type)}
     * @returns {Promise.<TokenValidationResponse>}
     */
    async validateTokenFromResponse(response: AuthenticationResult, idTokenOptions?: TokenValidationParameters, accessTokenOptions?: TokenValidationParameters): Promise<TokenValidationResponse[]> {
        this.logger.trace("TokenValidator.validateTokenFromResponse called");

        // Only validates token if tokenType from response is Bearer
        if (response.tokenType.toLowerCase() === AuthenticationScheme.BEARER.toLowerCase()) {
            this.logger.verbose("TokenValidator - Bearer authentication scheme confirmed");
            const validateResponse:TokenValidationResponse[] = [];

            if (!response.idToken && !response.accessToken) {
                this.logger.verbose("TokenValidator.validateTokenFromResponse - No tokens on response object to validate");
            }

            // Validates id token on response separately from access token
            if (response.idToken) {
                if (!idTokenOptions) {
                    this.logger.verbose("TokenValidator.validateTokenFromResponse - id token present on response but idTokenOptions not passed. Id token is not validated");
                } else {
                    this.logger.verbose("TokenValidator.validateTokenFromResponse - id token present on response, validating");

                    // Add code for validating c_hash if present
                    if (response.code) {
                        idTokenOptions.code = response.code;
                    }

                    // Add access token for validating at_hash if present
                    if (response.accessToken) {
                        idTokenOptions.accessTokenForAtHash = response.accessToken;
                    }

                    const validateIdTokenResponse: TokenValidationResponse = await this.validateToken(response.idToken, idTokenOptions);
                    validateResponse.push(validateIdTokenResponse);
                }
            }

            // Validates access token on response separately from id token
            if (response.accessToken) {
                if (!accessTokenOptions) {
                    this.logger.verbose("TokenValidator.validateTokenFromResponse - access token present on response but idTokenOptions not passed. Access token is not validated");
                } else {
                    this.logger.verbose("TokenValidator.validateTokenFromResponse - access token present on response, validating");
                    const validateAccessTokenResponse: TokenValidationResponse = await this.validateToken(response.accessToken, accessTokenOptions);
                    validateResponse.push(validateAccessTokenResponse);
                }
            }

            return validateResponse;
        } else {
            // If not bearer, investigate CAE/EasyAuth/MISE solution here for more complex handling
            throw ValidationConfigurationError.createInvalidAuthenticationScheme("TokenType in response is not bearer.");
        }
    }

    /**
     * Base function that validates tokens against options provided.
     * @param token JWT token to be validated
     * @param {@link (TokenValidationParameters:type)}
     * @returns {Promise.<TokenValidationResponse>}
     */
    async validateToken(token: string, options: TokenValidationParameters): Promise<TokenValidationResponse> {
        this.logger.trace("TokenValidator.validateToken called");
        
        if (!token || token.length < 1) {
            throw ValidationConfigurationError.createMissingTokenError();
        }

        // Sets defaults for validation params
        const validationParams: BaseValidationParameters = await buildTokenValidationParameters(options);
        this.logger.verbose("TokenValidator - ValidationParams built");
        
        // Sets JWKS to be used in jwtVerify
        const jwks = await this.getJWKS(validationParams);

        // Sets JWT verify options to be used in jwtVerify
        const jwtVerifyParams: JWTVerifyOptions = {
            algorithms: validationParams.validAlgorithms,
            issuer: this.setIssuerParams(validationParams),
            audience: this.setAudienceParams(validationParams),
            subject: validationParams.subject,
            typ: validationParams.validTypes[0],
            clockTolerance: this.setClockTolerance(this.config.auth.clockSkew)
        };

        // Verifies using JOSE's jwtVerify function. Returns payload and header
        const { payload, protectedHeader } = await jwtVerify(token, jwks, jwtVerifyParams);

        // Validates additional claims not verified by jwtVerify
        this.validateClaims(payload, validationParams);

        // Returns TokenValidationResponse
        return {
            protectedHeader,
            payload,
            token,
            tokenType: validationParams.validTypes[0]
        } as TokenValidationResponse;
    }
    
    /**
     * Function to return JWKS (JSON Web Key Set) from parameters provided, jwks_uri provided, or from well-known endpoint
     * @param {@link (BaseValidationParameters:type)}
     * @returns 
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getJWKS(validationParams: BaseValidationParameters): Promise<any> {
        this.logger.trace("TokenValidator.getJWKS called");
        
        // Prioritize keystore or jwksUri if provided
        if (validationParams.issuerSigningKeys) {
            this.logger.verbose("TokenValidator - issuerSigningKeys provided");
            return createLocalJWKSet({
                keys: validationParams.issuerSigningKeys
            });
        } 
        
        if (validationParams.issuerSigningJwksUri) {
            this.logger.verbose("TokenValidator - Creating JWKS from JwksUri");
            return createRemoteJWKSet(new URL(validationParams.issuerSigningJwksUri));
        }

        // Do resiliency well-known endpoint thing here
        const retrievedJwksUri: string = await this.openIdConfigProvider.fetchJwksUriFromEndpoint();
        this.logger.verbose("TokenValidator - Creating JWKS from default");
        return createRemoteJWKSet(new URL(retrievedJwksUri));
    }

    /**
     * Function to check that validIssuers parameter is not an empty array. Throws emptyIssuerError if empty.
     * @param {@link (BaseValidationParameters:type)}
     * @returns 
     */
    setIssuerParams(options: BaseValidationParameters): string[] {
        this.logger.trace("TokenValidator.setIssuerParams called");

        // Check that validIssuers is not empty
        if (options.validIssuers.length < 1 || options.validIssuers[0].length < 1) {
            throw ValidationConfigurationError.createEmptyIssuerError();
        }

        return options.validIssuers;
    }

    /**
     * Function to check that validAudiences parameter is not an empty array. Throws emptyAudience error if empty.
     * @param {@link (BaseValidationParameters:type)} 
     * @returns 
     */
    setAudienceParams(options: BaseValidationParameters): string[] {
        this.logger.trace("TokenValidator.setAudienceParams called");

        // Check that validAudiences is not empty
        if (options.validAudiences.length < 1 || options.validAudiences[0].length < 1) {
            throw ValidationConfigurationError.createEmptyAudienceError();
        }

        return options.validAudiences;
    }

    /**
     * Function to check that the clockSkew configuration is a positive integer. Throws negativeClockSkew error if not.
     * @param config 
     * @returns 
     */
    setClockTolerance(clockSkew: number): number {
        this.logger.trace("TokenValidator.setClockTolerance called");

        // Check that the clockSkew value is a positive integer
        if (clockSkew < 0) {
            throw ValidationConfigurationError.createNegativeClockSkewError();
        }

        return clockSkew;
    }
 
    /**
     * Function to validate additional claims on token, including nonce, c_hash, and at_hash. No return, throws error if invalid.
     * @param payload JWT payload
     * @param {@link (BaseValidationParameters:type)} 
     */
    async validateClaims(payload: JWTPayload, validationParams: BaseValidationParameters): Promise<void> {
        this.logger.trace("TokenValidator.validateClaims called");

        // Validate nonce in token against nonce provided in params
        if (payload.nonce) {
            if (!validationParams.nonce) {
                throw ValidationConfigurationError.createMissingNonceError();
            } else if (validationParams.nonce === payload.nonce) {
                this.logger.verbose("Nonce validated");
            } else {
                throw ValidationError.createInvalidNonceError();
            }
        }

        // Validate c_hash on token against code provided in params
        if (payload.c_hash && typeof payload.c_hash === "string") {
            this.logger.trace("TokenValidator - Validating c_hash");

            if (!validationParams.code) {
                this.logger.verbose("C_hash present on token but code not set in validationParams. Unable to validate c_hash");
            } else {
                const hashResult = await this.checkHashValue(validationParams.code, payload.c_hash);
                if (!hashResult) {
                    throw ValidationError.createInvalidCHashError();
                }
            }
        }

        // Validate at_hash on token against access token provided in params
        if (payload.at_hash && typeof payload.at_hash === "string") {
            this.logger.trace("TokenValidator - Validating at_hash");

            if (!validationParams.accessTokenForAtHash) {
                this.logger.verbose("At_hash present on token but access token not set in validationParams. Unable to validate at_hash");
            } else {
                const hashResult = await this.checkHashValue(validationParams.accessTokenForAtHash, payload.at_hash);
                if (!hashResult) {
                    throw ValidationError.createInvalidAtHashError();
                }
            }
        }
    }

    /**
     * Function to check hash per OIDC spec, section 3.3.2.11 https://openid.net/specs/openid-connect-core-1_0.html#HybridTokenValidation
     * @param content 
     * @param hashProvided 
     * @returns 
     */
    async checkHashValue(content: string, hashProvided: string): Promise<Boolean> {
        this.logger.trace("TokenValidator.checkHashValue called");

        // 1. Hash the content (either code for c_hash, or token for at_hash) and save as buffer
        const digest = crypto.createHash("sha256").update(content, "ascii").digest();

        // 2. Only take left half of buffer, per OIDC spec
        const buffer = digest.slice(0, digest.length/2);

        // 3. Base64Url encode the buffer to get the hash
        const encodedHash = buffer.toString("base64url");

        return (hashProvided === encodedHash);
    }
}
