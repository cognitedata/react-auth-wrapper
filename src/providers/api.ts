// Copyright 2022 Cognite AS
import { AxiosRequestConfig, AxiosResponse, Method } from 'axios';

import { IAuthRequest } from '../interfaces/auth';

abstract class Api implements IAuthRequest {
    constructor(private baseUrl: string) {}

    /**
     * Do some request using Axios.
     * @param method Method
     * @param endpoint string
     * @param config AxiosRequestConfig
     * @param data T
     * @returns Promise<AxiosResponse<U>>
     */
    abstract request<T = unknown, U = unknown>(
        method: Method,
        endpoint: string,
        config?: AxiosRequestConfig,
        data?: T
    ): Promise<AxiosResponse<U>>;
}

export default Api;
