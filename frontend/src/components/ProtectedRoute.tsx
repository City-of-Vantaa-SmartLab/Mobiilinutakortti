import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { AppState } from '../reducers';


interface PrivateRouteProps extends RouteProps {
    component: any;
    loggedIn: boolean;
}


const  ProtectedRoute = (props: PrivateRouteProps) => {
    const { component: Component, loggedIn, ...rest } = props;
    return (
      <Route
        {...rest}
        render={props => 
            loggedIn ? (
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

  const mapStateToProps = (state: AppState) => ({
    loggedIn: state.auth.loggedIn
  })

  export default connect(mapStateToProps)(ProtectedRoute)