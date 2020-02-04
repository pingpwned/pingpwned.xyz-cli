import React from 'react';
import LoginForm from './LoginForm';
import {
    BrowserRouter as Router,
    Switch,
    Route,
  } from "react-router-dom";
import PrivateRoute from './PrivateRoute'

export default class U2f extends React.Component {
    render() {
        return (
            <>
                <Router>
                    {/* <LoginForm /> */}
                    <Switch>
                        <Route exact path="/">
                            {/* <Login handleLoggedEvent={() => this.handleLoggedEvent()} /> */}
                            <LoginForm />
                        </Route>
                        <PrivateRoute exact path="/dashboard">
                            {/* <Dashboard /> */}
                            secret text
                        </PrivateRoute>
                    </Switch>
                </Router>
            </>
        )
    }
}