import { User, UserProfile } from "oidc-client-ts";

export declare type CogUserProfile = UserProfile;

export default class AuthCredentials extends User {
    constructor(args: {
        id_token?: string;
        session_state?: string | null;
        access_token: string;
        refresh_token?: string;
        token_type: string;
        scope?: string;
        profile: CogUserProfile;
        expires_at?: number;
        userState?: unknown;
    }) {
        super(args);
    }

    static override fromStorageString(storageString: string): AuthCredentials {
        return super.fromStorageString(storageString);
    }
}