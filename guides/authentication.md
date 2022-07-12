# Client Credentials

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **settings** (ISettings) | Oauth2 Credentials. |

***Returns***

| Return | Type |
| ------- | ---- |
| Returns a token string |  Promise<[AuthResponse]()> |

***Examples***

Aggregating asset:

```ts
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';

const token = await CogniteAuthWrapper.load(
    'client_credentials',
    {
        authority: 'your_authority',
        client_id: 'your_client_id',
        grant_type: 'your_grant_type',
        client_secret: 'your_client_secret',
        scope: 'your_scope'
    }
).login();
```

# Device Flow

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **settings** (ISettings) | Oauth2 Credentials. |

***Returns***

| Return | Type |
| ------- | ---- |
| Returns a token string |  Promise<[AuthResponse]()> |

***Examples***

Aggregating asset:

```ts
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';

const token = await CogniteAuthWrapper.load(
    'device'
    {
        authority: 'your_authority',
        client_id: 'your_client_id',
        scope: 'your_scope'
    }
).login();
```

# Device w Refresh Token Flow

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **settings** (ISettings) | Oauth2 Credentials. |

***Returns***

| Return | Type |
| ------- | ---- |
| Returns a token string |  Promise<[AuthResponse]()> |

***Examples***

Aggregating asset:

```ts
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';

const settings = {
    authority: 'your_authority',
    client_id: 'your_client_id',
    scope: 'your_scope'
};

// Retrieving access_token.
const tokenResponse = await CogniteAuthWrapper.load(
    'device',
    settings
).login();

// Retrieving token with previous refresh_token
const refreshedTokenResponse = await CogniteAuthWrapper.load(
    'device',
    settings
).login(tokenResponse?.refresh_token);
```

# Implicit Flow

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **settings** (ISettings) | Oauth2 Credentials. |

***Returns***

| Return | Type |
| ------- | ---- |
| Returns a token string |  Promise<[AuthResponse]()> |

***Examples***

Aggregating asset:

```ts
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';

const token = await CogniteAuthWrapper.load(
    'implicit',
    {
        authority: 'your_authority',
        client_id: 'your_client_id',
        scope: 'your_scope'
    }
).login();
```

# PKCE Flow

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **settings** (ISettings) | Oauth2 Credentials. |

***Returns***

| Return | Type |
| ------- | ---- |
| Returns a token string |  Promise<[AuthResponse]()> |

***Examples***

Aggregating asset:

```ts
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';

const token = await CogniteAuthWrapper.load(
    'pkce',
    {
        authority: 'your_authority',
        client_id: 'your_client_id',
        scope: 'your_scope'
    }
).login();
```

# PKCE w Refresh Token Flow

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **settings** (ISettings) | Oauth2 Credentials. |

***Returns***

| Return | Type |
| ------- | ---- |
| Returns a token string |  Promise<[AuthResponse]()> |

***Examples***

Aggregating asset:

```ts
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';

const settings = {
    authority: 'your_authority',
    client_id: 'your_client_id',
    scope: 'your_scope'
};

// Retrieving access_token.
const tokenResponse = await CogniteAuthWrapper.load(
    'pkce',
    settings
).login();

// Retrieving token with previous refresh_token
const refreshedTokenResponse = await CogniteAuthWrapper.load(
    'pkce',
    settings
).login(tokenResponse?.refresh_token);
```
