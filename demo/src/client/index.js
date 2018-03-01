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
    pbplusCognitoSdk: PbplusCognitoSdk.Reducer,
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
store.dispatch(PbplusCognitoSdk.Actions.fetchAuthState());

const ConnectedApp = connect(
    (state, ownProps) => {
        console.log(state.pbplusCognitoSdk);
        const { loginEndpoint, accessToken } = state.pbplusCognitoSdk;
        return {
            isUserLoggedIn: !!accessToken,
            loginEndpoint,
        };
    }
)(App);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedApp />
    </Provider>,
    document.getElementById('app-root')
);
