import React from 'react'
import { Redirect, Route } from 'react-router-dom'

 const PrivateRoute = ({ children, ...rest }) => (
    <Route
      {...rest}
      render={({ location }) =>
      localStorage.getItem('accessToken') ? (
            children
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: location }
            }}
          />
        )
      }
    />
);

export default PrivateRoute