import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import LoginPage from './loginPage/loginPage';
import QRPage from './QRPage/QRPage';
import A2hs from './A2hs';
import ProtectedRoute from './ProtectedRoute';


import { userTypes, userActions } from '../types/userTypes';
import { AppState } from '../reducers';

import { isIos, isInStandaloneMode } from '../utils';

const Wrapper = styled.section`
  height: 100%;
`;


interface AppProps {
  getUser: (token: string) => void,
  loggedIn: boolean,
  token: string
}

const App: React.FC<AppProps> = (props) => {
  const [showA2hs, setShowA2hs] = useState(false);


  useEffect(() => {
    if (props.loggedIn) {
      props.getUser(props.token)
    }
  }, [props.loggedIn, props.token]);

  //check if ios and open in a browser
  useEffect(() => {

    if (isIos() && !isInStandaloneMode()) {
      setShowA2hs(true);
    }
  }, []);

  const onClose = () => {
    setShowA2hs(false);
  }

  return (
    <Wrapper>
      <Switch>
        <Route path='/login' component={LoginPage} />
        <ProtectedRoute exact path='/' auth={props.loggedIn} component={QRPage} />
      </Switch>
      <A2hs isVisible={showA2hs} close={onClose} />
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
