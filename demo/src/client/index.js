// index.js
'use strict';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { connect, Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import PbplusCognitoSdk from '../../../src/index.js';
import App from './App.react.js';

const reducer = combineReducers({
    auth: PbplusCognitoSdk.Reducer,
})
const store = createStore(
    reducer,
    {
        pbplusCognitoSdk: {
            oauthUrl: process.env.OAUTH_URL,
            oauthSecret: process.env.OAUTH_SECRET,
            clientId: process.env.CLIENT_ID,
        }
    },
    applyMiddleware(ReduxThunk)
);

const ConnectedApp = connect(
    (state, ownProps) => {
        const { endpoint, accessToken } = state.auth;
        return {
            loginEndpoint: endpoint,
            isUserLoggedIn: !!accessToken,
        };
    }
)(App);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedApp />
    </Provider>,
    document.getElementById('app-root')
);
