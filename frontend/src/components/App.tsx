import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Navigate, Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import LoginPage from './loginPage/loginPage';
import QRPage from './QRPage/QRPage';
import A2hs from './A2hs';
import ParentRedirectView from './ParentRegistration/MainView';
import RegistrationView from './ParentRegistration/RegistrationView';
import LogoutView from './ParentRegistration/LogoutView';
import { userTypes, userActions } from '../types/userTypes';
import { authTypes, authActions } from '../types/authTypes';
import { AppState } from '../reducers';
import { theme } from '../customizations'

import { isIos, isInStandaloneMode } from '../utils';

const Wrapper = styled.section`
  height: 100%;
  display: flex;
`;


interface AppProps {
  getUser: (token: string) => void,
  authWithCache: () => void,
  loggedIn: boolean,
  token: string
}

const App: React.FC<AppProps> = ({ getUser, authWithCache, loggedIn, token }) => {
  const [showA2hs, setShowA2hs] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      getUser(token)
    }
  }, [loggedIn, token]);

  //if token not in state / localStorage, check cache for a token (for iOs issue with adding to homescreen)
  useEffect(() => {
    if (!loggedIn) {
      authWithCache()
    }
  }, []);

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
    <ThemeProvider theme={theme}>
      <Wrapper>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/' element={<LoginRequired loggedIn={loggedIn}><QRPage /></LoginRequired>} />
          <Route path='/hae' element={<ParentRedirectView />} />
          <Route path='/hakemus' element={<RegistrationView />} />
          <Route path='/uloskirjaus' element={<LogoutView />} />
         </Routes>
        <A2hs isVisible={showA2hs} close={onClose} />
      </Wrapper>
    </ThemeProvider>
  );
}

const LoginRequired = React.memo(function LoginRequired({
  loggedIn,
  children,
}: {
  loggedIn: boolean
  children: JSX.Element
}) {
  if (!loggedIn) {
    return <Navigate to="/login" />
  }
  return children
})

const mapStateToProps = (state: AppState) => ({
  loggedIn: state.auth.loggedIn,
  token: state.auth.token
});



const mapDispatchToProps = (dispatch: Dispatch<userActions | authActions>) => {
  return {
    getUser: (token: string) => {
      dispatch({
        type: userTypes.GET_USER,
        payload: token
      })
    },
    authWithCache: () => {
      dispatch({
        type: authTypes.AUTH_WITH_CACHE
      })
    },
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(App);
