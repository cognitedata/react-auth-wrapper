<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

# @cognite/auth-wrapper

[![codecov](https://codecov.io/gh/cognitedata/auth-wrapper/branch/main/graph/badge.svg?token=3dhnnL5sHo)](https://codecov.io/gh/cognitedata/auth-wrapper)

The `@cognite/auth-wrapper` is an OpenID Connect/OAuth 2.0 Wrapper library written in js that provides a convenient way to retrieve access token from any IdP that meets the openid pattern. You can use on client-side or server-side with JavaScript applications.

## Getting Started
There are some guides to help you to start using any of our available authentication methods.
The guides are at [authentication.md](./guides/authentication.md).

## Samples

There are small bare-bones typescript projects in the `samples/` directory.
They show how to include to retrieve a token with cognite Auth Wrapper by different methods.
The samples' [README.md](./samples/README.md) has instructions for running the samples.

E.g: Client Credentials
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

## License

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

### Contributing

Contributions welcome!
For details about commiting changes, automated versioning and releases, see [Contributing](./CONTRIBUTING.md).

### Testing

This repo contains some integration tests that require some IdP credentials to run.
You can use your own IdP credentials, talk to any of the contributors or leave an issue and it'll get sorted.
Github Actions will run the test and has its own api key.

Run tests:

```bash
npm install
npm test
```

We use `jest` to run tests, see [their documentation](https://github.com/facebook/jest) for more information.

## Changelog
Wondering about upcoming or previous changes to the auth-wrapper? Take a look at the [CHANGELOG](./CHANGELOG.md).

### Versioning

The libraries follow [Semantic Versioning](https://semver.org/).
Package versions are updated automatically and individually based on commit messages.
