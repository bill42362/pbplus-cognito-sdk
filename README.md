# pbplus-cognito-sdk
AWS Cognito login flow sdk for PBPlus.

## Behaviors ##
* Fetch refresh token from AWS::Cognito by `code` from cognito login page.
* Save fetched refresh token in cookie by `cookieDomain`.
* Fetch access token by refresh token from cookie.
* Auto-update access token (by `exporesIn` comes with access token).

## You can ##
* Read access token from `getState().pbplusCognitoSdk.accessToken`.
* Read login endpoint from `getState().pbplusCognitoSdk.loginEndpoint`.
* No access token in store means user not logged in.

## These values in redux store will be read. ##
```js
const store = createStore(
    reducer,
    {   
        pbplusCognitoSdk: {
            oauthUrl: process.env.OAUTH_URL,
            oauthSecret: process.env.OAUTH_SECRET,
            clientId: process.env.OAUTH_CLIENT_ID,
            cookieDomain: process.env.COOKIE_DOMAIN,
        }   
    }
);
```
* `oauthSecret` comes from  `Base64Encode(client_id:client_secret)`.
