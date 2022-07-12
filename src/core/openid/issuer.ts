// Copyright 2022 Cognite AS
import { IIssuer, IWellKnow } from '../../interfaces/issuer';
import Request from '../../providers/request';
import { DISCOVER } from './endpoints.json';

class Issuer implements IIssuer {
    constructor(protected issuer: string) {}

    /**
     * Return an instance of Issuer class.
     * @param issuer string
     * @returns new Issuer
     */
    static init(issuer: string) {
        return new this(issuer);
    }

    /**
     * Return endpoints and oAuth informations.
     * @returns Promise<IWellKnow>
     */
    async discover(): Promise<IWellKnow> {
        const { data: issuerResponse } = await Request.init(
            this.issuer
        ).request<unknown, IWellKnow>('GET', DISCOVER.uri);

        return issuerResponse;
    }
}

export default Issuer;
