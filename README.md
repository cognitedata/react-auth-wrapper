# react-auth-wrapper

[![Stable Release](https://img.shields.io/npm/v/react-auth-wrapper.svg)](https://npm.im/@cognite/react-auth-wrapper)

Lightweight auth library using the
[react-oidc-context](https://github.com/authts/react-oidc-context) library for React
single page applications (SPA). Support for
[hooks](https://reactjs.org/docs/hooks-intro.html) and
[higher-order components (HOC)](https://reactjs.org/docs/higher-order-components.html).

## Table of Contents

- [Documentation](#documentation)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Influences](#influences)
- [License](#license)

## Documentation

This library implements an auth context provider by making use of the
`oidc-client-ts` and `react-oidc-context` libraries. Its configuration is tight coupled to that library.

- [react-oidc-context](https://github.com/authts/react-oidc-context)
- [oidc-client-ts](https://github.com/authts/oidc-client-ts)

The
[`User`](https://authts.github.io/oidc-client-ts/classes/User.html)
and
[`UserManager`](https://authts.github.io/oidc-client-ts/classes/UserManager.html)
is hold in this context, which is accessible from the
React application. Additionally it intercepts the auth redirects by looking at
the query/fragment parameters and acts accordingly. You still need to setup a
redirect uri, which must point to your application, but you do not need to
create that route.

To renew the access token, the
[automatic silent renew](https://authts.github.io/oidc-client-ts/interfaces/UserManagerSettings.html#automaticSilentRenew)
feature of `oidc-client-ts` can be used.

## Installation

Using [npm](https://npmjs.org/)

```bash
npm install @cognite/react-auth-wrapper --save
```

## Getting Started

Configure the library by wrapping your application in `ReactCogniteAuthProvider`:

```jsx
// src/index.jsx
import React from "react";
import ReactDOM from "react-dom";
import { ReactCogniteAuthProvider } from "@cognite/react-auth-wrapper";
import App from "./App";

const oidcConfig = {
  authority: "<your authority>",
  client_id: "<your client id>",
  redirect_uri: "<your redirect uri>",
  // ...
};

ReactDOM.render(
  <ReactCogniteAuthProvider {...oidcConfig}>
    <App />
  </ReactCogniteAuthProvider>,
  document.getElementById("app")
);
```

Use the `useAuth` hook in your components to access authentication state
(`isLoading`, `isAuthenticated` and `user`) and authentication methods
(`signinRedirect`, `removeUser` and `signOutRedirect`):

```jsx
// src/App.jsx
import React from "react";
import { useCogAuth } from "@cognite/react-auth-wrapper";

function App() {
  const auth = useCogAuth();

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        Hello {auth.user?.profile.sub}{" "}
        <button onClick={() => void auth.removeUser()}>Log out</button>
      </div>
    );
  }

  return <button onClick={() => void auth.signinPopup()}>Log in</button>;
}

export default App;
```

You **must** provide an implementation of `onSigninCallback` to `oidcConfig` to remove the payload from the URL upon successful login. Otherwise if you refresh the page and the payload is still there, `signinSilent` - which handles renewing your token - won't work.

### Use with a Class Component

Use the `withAuth` higher-order component to add the `auth` property to class
components:

```jsx
// src/Profile.jsx
import React from "react";
import { withAuth } from "react-oidc-wrapper";

class Profile extends React.Component {
  render() {
    // `this.props.auth` has all the same properties as the `useAuth` hook
    const auth = this.props.auth;
    return <div>Hello {auth.user?.profile.sub}</div>;
  }
}

export default withAuth(Profile);
```

### Call a protected API

As a child of `AuthProvider` with a user containing an access token:

```jsx
// src/Posts.jsx
import React from "react";
import { useAuth } from "@cognite/react-auth-wrapper";

const Posts = () => {
  const auth = useCogAuth();
  const [posts, setPosts] = useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const token = auth.user?.access_token;
        const response = await fetch("https://api.example.com/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(await response.json());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [auth]);

  if (!posts) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {posts.map((post, index) => {
        return <li key={index}>{post}</li>;
      })}
    </ul>
  );
};

export default Posts;
```

As **not** a child of `AuthProvider` (e.g. redux slice) when using local storage
(`WebStorageStateStore`) for the user containing an access token:

```jsx
// src/slice.js
import { User } from "oidc-client-ts";

function getUser() {
  const oidcStorage = localStorage.getItem(
    `oidc.user:<your authority>:<your client id>`
  );
  if (!oidcStorage) {
    return null;
  }

  return User.fromStorageString(oidcStorage);
}

export const getPosts = createAsyncThunk(
  "store/getPosts",
  async () => {
    const user = getUser();
    const token = user?.access_token;
    return fetch("https://api.example.com/posts", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  // ...
);
```

### Adding event listeners

The underlying [`UserManagerEvents`](https://authts.github.io/oidc-client-ts/classes/UserManagerEvents.html) instance can be imperatively managed with the `useAuth` hook.

```jsx
// src/App.jsx
import React from "react";
import { useCogAuth } from "@cognite/react-auth-wrapper";

function App() {
  const auth = useCogAuth();

  React.useEffect(() => {
    // the `return` is important - addAccessTokenExpiring() returns a cleanup function
    return auth.events.addAccessTokenExpiring(() => {
      if (
        alert(
          "You're about to be signed out due to inactivity. Press continue to stay signed in."
        )
      ) {
        auth.signinSilent();
      }
    });
  }, [auth.events, auth.signinSilent]);

  return <button onClick={() => void auth.signinRedirect()}>Log in</button>;
}

export default App;
```

## Contributing

We appreciate feedback and contribution to this repo!

## License

This project is licensed under the MIT license. See the
[LICENSE](https://github.com/cognitedata/react-auth-wrapper/blob/main/LICENSE) file
for more info.
