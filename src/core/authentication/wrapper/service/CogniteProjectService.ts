import { CogAuthContextProps } from "../CogAuthContextProps";
import { CogniteProject } from "../CogniteProject";

const { COGNITE_BASE_URL } = process.env;
const { REACT_APP_COGNITE_BASE_URL } = process.env;

const DEFAULT_TOKEN_INSPECT_ENDPOINT = '/api/v1/token/inspect';

interface CogniteProjectOptions {
  cogniteCluster?: string, 
  cogniteBaseURL?: string
}
export class CogniteProjectService {
    private tokenInspectURL: string;

    constructor(options?: CogniteProjectOptions) {
      if (options?.cogniteCluster) {
        this.tokenInspectURL = `https://${options?.cogniteCluster}.cognitedata.com${DEFAULT_TOKEN_INSPECT_ENDPOINT}`
      } else if (options?.cogniteBaseURL) {
        this.tokenInspectURL = new URL(DEFAULT_TOKEN_INSPECT_ENDPOINT, options?.cogniteBaseURL).toString();
      } else {
        const baseUrl = REACT_APP_COGNITE_BASE_URL || COGNITE_BASE_URL;
        if (!baseUrl) {
          throw new Error(
            "No cognite base URL was defined for token inspect."+
            "Please use another constructor or provide an environment variable named as REACT_APP_COGNITE_BASE_URL or COGNITE_BASE_URL"
          );
        }

        this.tokenInspectURL = new URL(DEFAULT_TOKEN_INSPECT_ENDPOINT, baseUrl).toString();
      }
    }

    public async loadFromAccessToken(accessToken: string | undefined): Promise<CogniteProject[]> {
        if(!accessToken)
          return [];
      
        const Authorization = `Bearer ${accessToken}`;
        const response = await fetch(this.tokenInspectURL, {
          method: 'GET',  
          headers: {
            Authorization
          }
        })
        const tokenInspectResponse = await response.json();
        return tokenInspectResponse.projects;
    }
    public async loadFromAuthContext(authContext: CogAuthContextProps): Promise<CogniteProject[]> {
      const accessToken: string | undefined = authContext?.user?.access_token;

      return await this.loadFromAccessToken(accessToken);
    }
}
