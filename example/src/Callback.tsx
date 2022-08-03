import React from 'react';
import { useCogAuth } from '@cognite/react-auth-wrapper';

function Callback() {
  const authContext: any = useCogAuth();

  return (
    <>
      {JSON.stringify(authContext)}
    </>
  )
}

export default Callback;
