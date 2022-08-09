import React, { useState } from 'react';
import { CogAuthContextProps, CogniteProject, CogniteProjectService, useCogAuth } from '@cognite/react-auth-wrapper';

function SelectCogniteProject() {
  const authContext: CogAuthContextProps = useCogAuth();

  const [list, setList] = useState<CogniteProject[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const cogniteProjectService = new CogniteProjectService();
        const projects = await cogniteProjectService.loadFromAuthContext(authContext);
        setList(projects);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [authContext]);

  if (!list) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {list.map((project, index) => {
          return <li key={index}>{project.projectUrlName}</li>;
      })}
    </ul>
  )
}

export default SelectCogniteProject;
