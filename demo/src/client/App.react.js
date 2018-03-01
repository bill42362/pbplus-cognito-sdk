// App.react.js
import React from 'react';

class App extends React.Component {
    constructor(props) { super(props); }
    render() {
        const { loginEndpoint, isUserLoggedIn } = this.props;
        return <div className='app'>
            <div>You are {!isUserLoggedIn && <span>not</span>} logged in.</div>
            {!isUserLoggedIn && <div>Click <a href={loginEndpoint} title='login'>here</a> to login.</div>}
        </div>;
    }
}

export default App;
