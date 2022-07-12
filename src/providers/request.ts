// Copyright 2022 Cognite AS
import axios, { Axios, AxiosRequestConfig, AxiosResponse, Method } from 'axios';

import { IAuthRequest } from '../interfaces/auth';
import Api from './api';

class Request extends Api implements IAuthRequest {
    private instance: Axios;

    constructor(baseUrl: string) {
        super(baseUrl);
        this.instance = axios.create({
            baseURL: baseUrl,
        });
    }

    /**
     * Return an instance of Request class.
     * @param baseUrl string
     * @returns new Request
     */
    static init(baseUrl: string) {
        return new this(baseUrl);
    }

    /**
     * Do some request using Axios.
     * @param method Method
     * @param endpoint string
     * @param config AxiosRequestConfig
     * @param data T
     * @returns Promise<AxiosResponse<U>>
     */
    async request<T = unknown, U = unknown>(
        method: Method,
        endpoint: string,
        config?: AxiosRequestConfig,
        data?: T
    ): Promise<AxiosResponse<U>> {
        return this.instance.request({
            method,
            url: endpoint,
            ...(data ? { data } : {}),
            ...(config?.headers ? { headers: config.headers } : {}),
            ...(config?.params ? { params: config.params } : {}),
        });
    }
}

export default Request;
