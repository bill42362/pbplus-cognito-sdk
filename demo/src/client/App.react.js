// App.react.js
import React from 'react';

class App extends React.Component {
    constructor(props) { super(props); }
    render() {
        const { loginEndpoint, isUserLoggedIn, logout } = this.props;
        return <div className='app'>
            <div>You are {!isUserLoggedIn && <span>not</span>} logged in.</div>
            {!isUserLoggedIn && <div>Click <a href={loginEndpoint} title='login'>here</a> to login.</div>}
            {isUserLoggedIn && <div>Click <a title='logout' role='button' onClick={logout}>here</a> to logout.</div>}
        </div>;
    }
}

export default App;
