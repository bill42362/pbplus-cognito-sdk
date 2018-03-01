// index.js
'use strict';
import 'isomorphic-fetch';
import { getUrlSearches, makeSearchString, getCookieByName, saveCookieByName } from './Utils.js';

const isProd = 'production' === process.env.NODE_ENV;
const CODE_KEY = 'code';
const COOKIE_REFRESH_TOKEN_KEY = 'pbplus_backstage_refresh_token';
const MSECS_IN_SIX_DAYS = 6*24*3600*1000;
let refreshToken = getCookieByName({name: COOKIE_REFRESH_TOKEN_KEY});

const getTokensByAccessCode = ({ code, clientId, oauthUrl, oauthSecret }) => {
    const postData = {
        code,
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: location.origin,
    };
    return fetch(`${oauthUrl}/oauth2/token`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${oauthSecret}`,
        },
        body: makeSearchString(postData)
    })
    .then(response => {
        if(response.status !== 200) { throw new Error('Bad response from server'); }
        return response.json();
    })
    .then(response => {
        return {
            idToken: response.id_token,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            expiresIn: response.expires_in,
        };
    })
    .catch(error => {
        console.log('getTokensByAccessCode() error:', error);
    });
};

const getAccessTokenByRefreshToken = ({ refreshToken, clientId, oauthUrl, oauthSecret }) => {
    const postData = {
        grant_type: 'refresh_token',
        client_id: clientId,
        refresh_token: refreshToken,
    };
    return fetch(`${oauthUrl}/oauth2/token`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${oauthSecret}`,
        },
        body: makeSearchString(postData)
    })
    .then(response => {
        if(response.status !== 200) { throw new Error('Bad response from server'); }
        return response.json();
    })
    .then(response => {
        return {
            idToken: response.id_token,
            accessToken: response.access_token,
            expiresIn: response.expires_in,
        };
    })
    .catch(error => {
        console.log('getAccessTokenByRefreshToken() error:', error);
    });
};

const defaultState = {
    accessToken: '',
    endpoint: 'http://localhost:3000',
};

const Reducer = (state = defaultState, action) => {
    switch(action.type) {
        case 'UPDATE_AUTH_LOGIN_ENDPOINT':
        case 'UPDATE_AUTH_ACCESS_TOKEN':
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}

const updateLoginEndpoint = ({ loginEndpoint }) => { return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
        dispatch({type: 'UPDATE_AUTH_LOGIN_ENDPOINT', payload: { loginEndpoint }});
        resolve({ loginEndpoint });
    });
}; };

const updateAccessToken = ({ accessToken }) => { return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
        dispatch({type: 'UPDATE_AUTH_ACCESS_TOKEN', payload: { accessToken }});
        resolve({ accessToken });
    });
}; };

let refreshAccessTokenTimeout = undefined;

const fetchAccessToken = () => (dispatch, getState) => {
    const { oauthUrl, clientId, oauthSecret } = getState().pbplusCognitoSdk;
    const urlSearches = getUrlSearches();
    const accessCodeFromSearch = urlSearches[CODE_KEY];
    delete urlSearches[CODE_KEY];
    const newSearchString = makeSearchString(urlSearches);
    window.history.replaceState('', '', `${location.pathname}${newSearchString ? '?' : ''}${newSearchString}`);
    if(accessCodeFromSearch) {
        return getTokensByAccessCode({code: accessCodeFromSearch, clientId, oauthUrl, oauthSecret })
        .then(response => {
            saveCookieByName({
                name: COOKIE_REFRESH_TOKEN_KEY,
                data: response.refreshToken,
                domain: isProd ? '.pbplus.me' : undefined,
                expireDate: new Date(Date.now() + MSECS_IN_SIX_DAYS),
            });
            refreshToken = response.refreshToken;
            return dispatch(updateAccessToken({accessToken: response.accessToken}));
        });
    } else if(refreshToken) {
        return getAccessTokenByRefreshToken({ refreshToken, clientId, oauthUrl, oauthSecret })
        .then(response => {
            refreshAccessTokenTimeout = window.setTimeout(() => {
                dispatch(fetchAccessToken());
            }, (response.expiresIn - 600)*1000);
            return dispatch(updateAccessToken({accessToken: response.accessToken}));
        });
    }
};

const fetchAuthState = () => (dispatch, getState) => {
    const { oauthUrl, clientId } = getState().pbplusCognitoSdk;
    const loginEndpoint = `${oauthUrl}/login?response_type=code&client_id=${clientId}&redirect_uri=${location.origin}`;
    return dispatch(updateLoginEndpoint({ loginEndpoint }))
        .then(dispatch(fetchAccessToken()));
};

const Actions = { fetchAuthState };

export default { Reducer, Actions };
