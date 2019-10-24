import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';


interface PrivateRouteProps extends RouteProps {
  component: any;
  auth: boolean;
}


const ProtectedRoute = (props: PrivateRouteProps) => {
  const { component: Component, auth, ...rest } = props;
  return (
    <Route
      {...rest}
      render={props =>
        auth ? (
          <Component {...props} />
        ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location }
              }}
            />
          )
      }
    />
  );
}

export default ProtectedRoute;
