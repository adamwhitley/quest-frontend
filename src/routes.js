import React from 'react';
import { Route, Router } from 'react-router-dom';
import App from './App';
import Home from './Home.js';
import Site from './Site.js';
import Create from './Create.js';
import Callback from './Callback/Callback';
import Auth from './Auth/Auth';
import history from './history';

const auth = new Auth();

const handleAuthentication = (nextState, replace) => {
    if (/access_token|id_token|error/.test(nextState.location.hash)) {
        auth.handleAuthentication();
    }
};

export const makeMainRoutes = () => {
    let allDevices = [];
    return (
        <Router history={history} component={App}>
            <div>
                {/*<Route path="/" render={(props) => <App auth={auth} {...props} />} />*/}
                <Route path="/" render={(props) => <App {...props} />} />
                {/*<Route path="/home" render={(props) => <Home {...props} />} />
                <Route path="/setup" render={(props) => <Create {...props} />} />*/}
                <Route path="/home" render={(props) => <Site {...props} allDevices={allDevices} />} />
                <Route path="/site" render={(props) => <Site {...props} allDevices={allDevices} />} />
                <Route exact path="/" render={(props) => <Site {...props} allDevices={allDevices} />} />
                <Route path="/callback" render={(props) => {
                    handleAuthentication(props);
                    return <Callback {...props} />
                }}/>
            </div>
        </Router>
    );
};