import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';


interface PrivateRouteProps extends RouteProps {
    component: any;
}


export const  ProtectedRoute = (props: PrivateRouteProps) => {
    const { component: Component,  ...rest } = props;
    return (
      <Route
        {...rest}
        render={props =>
            localStorage.getItem('token') ? (
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