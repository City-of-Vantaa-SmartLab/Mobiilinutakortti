import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import LoginPage from './loginPage/loginPage';
import QRPage from './QRPage/QRPage';
import ProtectedRoute from './ProtectedRoute';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { userTypes, userActions } from '../types/userTypes';
import { AppState } from '../reducers';

const Wrapper = styled.section`
  height: 100%;
`;

interface AppProps {
  getUser: (token: string) => void,
  loggedIn: boolean,
  token: string
}


const App: React.FC<AppProps> = (props) => {

  useEffect(() => {
    if (props.loggedIn) {
      props.getUser(props.token)
    }
  }, [props.loggedIn, props.token]);

  return (
    <Wrapper>
      <Switch>
        <Route path='/login' component={LoginPage} />
        <ProtectedRoute exact path='/' auth={props.loggedIn} component={QRPage} />
      </Switch>
    </Wrapper>
  );
}

const mapStateToProps = (state: AppState) => ({
  loggedIn: state.auth.loggedIn,
  token: state.auth.token
});



const mapDispatchToProps = (dispatch: Dispatch<userActions>) => {
  return {
    getUser: (token: string) => {
      dispatch({
        type: userTypes.GET_USER,
        payload: token
      })
    }
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(App);
