/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    AuthorizationCodeClient,
    ClientConfiguration,
    RefreshTokenClient,
    AuthenticationResult,
    Authority,
    AuthorityFactory,
    BaseAuthRequest,
    SilentFlowClient,
    Logger,
    ServerTelemetryManager,
    ServerTelemetryRequest,
    CommonSilentFlowRequest,
    CommonRefreshTokenRequest,
    CommonAuthorizationCodeRequest,
    CommonAuthorizationUrlRequest,
    CommonUsernamePasswordRequest,
    UsernamePasswordClient,
    AuthenticationScheme,
    ResponseMode,
    AuthorityOptions,
    OIDC_DEFAULT_SCOPES,
    AzureRegionConfiguration,
    AuthError,
    AzureCloudOptions,
    AuthorizationCodePayload,
    StringUtils,
    Constants,
} from "@azure/msal-common";
import { Configuration, buildAppConfiguration, NodeConfiguration } from "../config/Configuration";
import { CryptoProvider } from "../crypto/CryptoProvider";
import { NodeStorage } from "../cache/NodeStorage";
import { Constants as NodeConstants, ApiId } from "../utils/Constants";
import { TokenCache } from "../cache/TokenCache";
import { ClientAssertion } from "./ClientAssertion";
import { AuthorizationUrlRequest } from "../request/AuthorizationUrlRequest";
import { AuthorizationCodeRequest } from "../request/AuthorizationCodeRequest";
import { RefreshTokenRequest } from "../request/RefreshTokenRequest";
import { SilentFlowRequest } from "../request/SilentFlowRequest";
import { version, name } from "../packageMetadata";
import { UsernamePasswordRequest } from "../request/UsernamePasswordRequest";

/**
 * Base abstract class for all ClientApplications - public and confidential
 * @public
 */
export abstract class ClientApplication {

    private readonly cryptoProvider: CryptoProvider;
    private tokenCache: TokenCache;

    /**
     * Platform storage object
     */
    protected storage: NodeStorage;
    /**
     * Logger object to log the application flow
     */
    protected logger: Logger;
    /**
     * Platform configuration initialized by the application
     */
    protected config: NodeConfiguration;
    /**
     * Client assertion passed by the user for confidential client flows
     */
    protected clientAssertion: ClientAssertion;
    /**
     * Client secret passed by the user for confidential client flows
     */
    protected clientSecret: string;

    /**
     * Constructor for the ClientApplication
     */
    protected constructor(configuration: Configuration) {
        this.config = buildAppConfiguration(configuration);
        this.cryptoProvider = new CryptoProvider();
        this.logger = new Logger(this.config.system.loggerOptions, name, version);
        this.storage = new NodeStorage(this.logger, this.config.auth.clientId, this.cryptoProvider);
        this.tokenCache = new TokenCache(
            this.storage,
            this.logger,
            this.config.cache.cachePlugin
        );
    }

    /**
     * Creates the URL of the authorization request, letting the user input credentials and consent to the
     * application. The URL targets the /authorize endpoint of the authority configured in the
     * application object.
     *
     * Once the user inputs their credentials and consents, the authority will send a response to the redirect URI
     * sent in the request and should contain an authorization code, which can then be used to acquire tokens via
     * `acquireTokenByCode(AuthorizationCodeRequest)`.
     */
    async getAuthCodeUrl(request: AuthorizationUrlRequest): Promise<string> {
        this.logger.info("getAuthCodeUrl called", request.correlationId);
        const validRequest: CommonAuthorizationUrlRequest = {
            ...request,
            ... await this.initializeBaseRequest(request),
            responseMode: request.responseMode || ResponseMode.QUERY,
            authenticationScheme: AuthenticationScheme.BEARER
        };

        const authClientConfig = await this.buildOauthClientConfiguration(
            validRequest.authority,
            validRequest.correlationId,
            undefined,
            undefined,
            request.azureCloudOptions
        );
        const authorizationCodeClient = new AuthorizationCodeClient(
            authClientConfig
        );
        this.logger.verbose("Auth code client created", validRequest.correlationId);
        return authorizationCodeClient.getAuthCodeUrl(validRequest);
    }

    /**
     * Acquires a token by exchanging the Authorization Code received from the first step of OAuth2.0
     * Authorization Code flow.
     *
     * `getAuthCodeUrl(AuthorizationCodeUrlRequest)` can be used to create the URL for the first step of OAuth2.0
     * Authorization Code flow. Ensure that values for redirectUri and scopes in AuthorizationCodeUrlRequest and
     * AuthorizationCodeRequest are the same.
     */
    async acquireTokenByCode(request: AuthorizationCodeRequest, authCodePayLoad?: AuthorizationCodePayload): Promise<AuthenticationResult | null> {
        this.logger.info("acquireTokenByCode called", request.correlationId);
        const validRequest: CommonAuthorizationCodeRequest = {
            ...request,
            ... await this.initializeBaseRequest(request),
            authenticationScheme: AuthenticationScheme.BEARER
        };
        const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenByCode, validRequest.correlationId);
        try {
            const authClientConfig = await this.buildOauthClientConfiguration(
                validRequest.authority,
                validRequest.correlationId,
                serverTelemetryManager,
                undefined,
                request.azureCloudOptions
            );
            const authorizationCodeClient = new AuthorizationCodeClient(
                authClientConfig
            );
            this.logger.verbose("Auth code client created", validRequest.correlationId);
            return authorizationCodeClient.acquireToken(validRequest, authCodePayLoad);
        } catch (e) {
            if (e instanceof AuthError) {
                e.setCorrelationId(validRequest.correlationId);
            }
            serverTelemetryManager.cacheFailedRequest(e);
            throw e;
        }
    }

    /**
     * Acquires a token by exchanging the refresh token provided for a new set of tokens.
     *
     * This API is provided only for scenarios where you would like to migrate from ADAL to MSAL. Otherwise, it is
     * recommended that you use `acquireTokenSilent()` for silent scenarios. When using `acquireTokenSilent()`, MSAL will
     * handle the caching and refreshing of tokens automatically.
     */
    async acquireTokenByRefreshToken(request: RefreshTokenRequest): Promise<AuthenticationResult | null> {
        this.logger.info("acquireTokenByRefreshToken called", request.correlationId);
        const validRequest: CommonRefreshTokenRequest = {
            ...request,
            ... await this.initializeBaseRequest(request),
            authenticationScheme: AuthenticationScheme.BEARER
        };

        const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenByRefreshToken, validRequest.correlationId);
        try {
            const refreshTokenClientConfig = await this.buildOauthClientConfiguration(
                validRequest.authority,
                validRequest.correlationId,
                serverTelemetryManager,
                undefined,
                request.azureCloudOptions
            );
            const refreshTokenClient = new RefreshTokenClient(
                refreshTokenClientConfig
            );
            this.logger.verbose("Refresh token client created", validRequest.correlationId);
            return refreshTokenClient.acquireToken(validRequest);
        } catch (e) {
            if (e instanceof AuthError) {
                e.setCorrelationId(validRequest.correlationId);
            }
            serverTelemetryManager.cacheFailedRequest(e);
            throw e;
        }
    }

    /**
     * Acquires a token silently when a user specifies the account the token is requested for.
     *
     * This API expects the user to provide an account object and looks into the cache to retrieve the token if present.
     * There is also an optional "forceRefresh" boolean the user can send to bypass the cache for access_token and id_token.
     * In case the refresh_token is expired or not found, an error is thrown
     * and the guidance is for the user to call any interactive token acquisition API (eg: `acquireTokenByCode()`).
     */
    async acquireTokenSilent(request: SilentFlowRequest): Promise<AuthenticationResult | null> {
        const validRequest: CommonSilentFlowRequest = {
            ...request,
            ... await this.initializeBaseRequest(request),
            forceRefresh: request.forceRefresh || false
        };

        const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenSilent, validRequest.correlationId, validRequest.forceRefresh);
        try {
            const silentFlowClientConfig = await this.buildOauthClientConfiguration(
                validRequest.authority,
                validRequest.correlationId,
                serverTelemetryManager,
                undefined,
                request.azureCloudOptions
            );
            const silentFlowClient = new SilentFlowClient(
                silentFlowClientConfig
            );
            this.logger.verbose("Silent flow client created", validRequest.correlationId);
            return silentFlowClient.acquireToken(validRequest);
        } catch (e) {
            if (e instanceof AuthError) {
                e.setCorrelationId(validRequest.correlationId);
            }
            serverTelemetryManager.cacheFailedRequest(e);
            throw e;
        }
    }

    /**
     * Acquires tokens with password grant by exchanging client applications username and password for credentials
     *
     * The latest OAuth 2.0 Security Best Current Practice disallows the password grant entirely.
     * More details on this recommendation at https://tools.ietf.org/html/draft-ietf-oauth-security-topics-13#section-3.4
     * Microsoft's documentation and recommendations are at:
     * https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-authentication-flows#usernamepassword
     *
     * @param request - UsenamePasswordRequest
     */
    async acquireTokenByUsernamePassword(request: UsernamePasswordRequest): Promise<AuthenticationResult | null> {
        this.logger.info("acquireTokenByUsernamePassword called", request.correlationId);
        const validRequest: CommonUsernamePasswordRequest = {
            ...request,
            ... await this.initializeBaseRequest(request)
        };
        const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenByUsernamePassword, validRequest.correlationId);
        try {
            const usernamePasswordClientConfig = await this.buildOauthClientConfiguration(
                validRequest.authority,
                validRequest.correlationId,
                serverTelemetryManager,
                undefined,
                request.azureCloudOptions
            );
            const usernamePasswordClient = new UsernamePasswordClient(usernamePasswordClientConfig);
            this.logger.verbose("Username password client created", validRequest.correlationId);
            return usernamePasswordClient.acquireToken(validRequest);
        } catch (e) {
            if (e instanceof AuthError) {
                e.setCorrelationId(validRequest.correlationId);
            }
            serverTelemetryManager.cacheFailedRequest(e);
            throw e;
        }
    }

    /**
     * Gets the token cache for the application.
     */
    getTokenCache(): TokenCache {
        this.logger.info("getTokenCache called");
        return this.tokenCache;
    }

    /**
     * Returns the logger instance
     */
    getLogger(): Logger {
        return this.logger;
    }

    /**
     * Replaces the default logger set in configurations with new Logger with new configurations
     * @param logger - Logger instance
     */
    setLogger(logger: Logger): void {
        this.logger = logger;
    }

    /**
     * Builds the common configuration to be passed to the common component based on the platform configurarion
     * @param authority - user passed authority in configuration
     * @param serverTelemetryManager - initializes servertelemetry if passed
     */
    protected async buildOauthClientConfiguration(
        authority: string,
        requestCorrelationId?: string, 
        serverTelemetryManager?: ServerTelemetryManager,
        azureRegionConfiguration?: AzureRegionConfiguration, 
        azureCloudOptions?: AzureCloudOptions): Promise<ClientConfiguration> {
        
        this.logger.verbose("buildOauthClientConfiguration called", requestCorrelationId);

        // precedence - azureCloudInstance + tenant >> authority and request  >> config
        const userAzureCloudOptions = azureCloudOptions ? azureCloudOptions : this.config.auth.azureCloudOptions;

        // using null assertion operator as we ensure that all config values have default values in buildConfiguration()
        this.logger.verbose(`building oauth client configuration with the authority: ${authority}`, requestCorrelationId);
        const discoveredAuthority = await this.createAuthority(authority, azureRegionConfiguration, requestCorrelationId, userAzureCloudOptions);

        serverTelemetryManager?.updateRegionDiscoveryMetadata(discoveredAuthority.regionDiscoveryMetadata);

        const clientConfiguration: ClientConfiguration = {
            authOptions: {
                clientId: this.config.auth.clientId,
                authority: discoveredAuthority,
                clientCapabilities: this.config.auth.clientCapabilities
            },
            systemOptions: {
                proxyUrl: this.config.system.proxyUrl,
            },
            loggerOptions: {
                logLevel: this.config.system.loggerOptions.logLevel,
                loggerCallback: this.config.system.loggerOptions
                    .loggerCallback,
                piiLoggingEnabled: this.config.system.loggerOptions
                    .piiLoggingEnabled,
                correlationId: requestCorrelationId
            },
            cryptoInterface: this.cryptoProvider,
            networkInterface: this.config.system.networkClient,
            storageInterface: this.storage,
            serverTelemetryManager: serverTelemetryManager,
            clientCredentials: {
                clientSecret: this.clientSecret,
                clientAssertion: this.clientAssertion ? this.getClientAssertion(discoveredAuthority) : undefined,
            },
            libraryInfo: {
                sku: NodeConstants.MSAL_SKU,
                version: version,
                cpu: process.arch || Constants.EMPTY_STRING,
                os: process.platform || Constants.EMPTY_STRING,
            },
            telemetry: this.config.telemetry,
            persistencePlugin: this.config.cache.cachePlugin,
            serializableCache: this.tokenCache            
        };

        return clientConfiguration;
    }

    private getClientAssertion(authority: Authority): { assertion: string, assertionType: string } {
        return {
            assertion: this.clientAssertion.getJwt(this.cryptoProvider, this.config.auth.clientId, authority.tokenEndpoint),
            assertionType: NodeConstants.JWT_BEARER_ASSERTION_TYPE
        };
    }

    /**
     * Generates a request with the default scopes & generates a correlationId.
     * @param authRequest - BaseAuthRequest for initialization
     */
    protected async initializeBaseRequest(authRequest: Partial<BaseAuthRequest>): Promise<BaseAuthRequest> {
        this.logger.verbose("initializeRequestScopes called", authRequest.correlationId);
        // Default authenticationScheme to Bearer, log that POP isn't supported yet
        if (authRequest.authenticationScheme && authRequest.authenticationScheme === AuthenticationScheme.POP) {
            this.logger.verbose("Authentication Scheme 'pop' is not supported yet, setting Authentication Scheme to 'Bearer' for request", authRequest.correlationId);
        }

        authRequest.authenticationScheme = AuthenticationScheme.BEARER;

        // Set requested claims hash if claims were requested
        if (authRequest.claims && !StringUtils.isEmpty(authRequest.claims)) {
            authRequest.requestedClaimsHash = await this.cryptoProvider.hashString(authRequest.claims);
        }

        return {
            ...authRequest,
            scopes: [...((authRequest && authRequest.scopes) || []), ...OIDC_DEFAULT_SCOPES],
            correlationId: authRequest && authRequest.correlationId || this.cryptoProvider.createNewGuid(),
            authority: authRequest.authority || this.config.auth.authority
        };
    }

    /**
     * Initializes the server telemetry payload
     * @param apiId - Id for a specific request
     * @param correlationId - GUID
     * @param forceRefresh - boolean to indicate network call
     */
    protected initializeServerTelemetryManager(apiId: number, correlationId: string, forceRefresh?: boolean): ServerTelemetryManager {
        const telemetryPayload: ServerTelemetryRequest = {
            clientId: this.config.auth.clientId,
            correlationId: correlationId,
            apiId: apiId,
            forceRefresh: forceRefresh || false
        };

        return new ServerTelemetryManager(telemetryPayload, this.storage);
    }

    /**
     * Create authority instance. If authority not passed in request, default to authority set on the application
     * object. If no authority set in application object, then default to common authority.
     * @param authorityString - authority from user configuration
     */
    private async createAuthority(authorityString: string, azureRegionConfiguration?: AzureRegionConfiguration, requestCorrelationId?: string, azureCloudOptions?: AzureCloudOptions): Promise<Authority> {
        this.logger.verbose("createAuthority called", requestCorrelationId);

        // build authority string based on auth params - azureCloudInstance is prioritized if provided
        const authorityUrl = Authority.generateAuthority(authorityString, azureCloudOptions);

        const authorityOptions: AuthorityOptions = {
            protocolMode: this.config.auth.protocolMode,
            knownAuthorities: this.config.auth.knownAuthorities,
            cloudDiscoveryMetadata: this.config.auth.cloudDiscoveryMetadata,
            authorityMetadata: this.config.auth.authorityMetadata,
            azureRegionConfiguration,
            skipAuthorityMetadataCache: this.config.auth.skipAuthorityMetadataCache,
        };

        return await AuthorityFactory.createDiscoveredInstance(authorityUrl, this.config.system.networkClient, this.storage, authorityOptions, this.config.system.proxyUrl);
    }

    /**
     * Clear the cache
     */
    clearCache(): void {
        this.storage.clear();
    }
}
