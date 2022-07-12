 import * as React from 'react';
 import {AuthContextInterface} from './types';
 
 const AuthContext = React.createContext<AuthContextInterface | null>(null);
 
 const AuthContextConsumer = AuthContext.Consumer;
 export {AuthContextConsumer};
 export default AuthContext;