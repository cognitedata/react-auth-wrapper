import { CogAuthContextProps } from "../CogAuthContextProps";
import { CogniteProject } from "../CogniteProject";

export class CogniteProjectService {
    tokenInspectURL: string;
    
    constructor(protected cogniteCluster: string) {
      this.tokenInspectURL = `https://${cogniteCluster}.cognitedata.com/api/v1/token/inspect`
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
        const unknown = await response.json();
        return await unknown.projects;
    }
    public async loadFromAuthContext(authContext: CogAuthContextProps): Promise<CogniteProject[]> {
      const accessToken: string | undefined = authContext?.user?.access_token;

      return await this.loadFromAccessToken(accessToken);
    }
}
