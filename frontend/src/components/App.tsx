import React, {useState, useEffect, useCallback} from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from './loginPage/loginPage';
import QRPage from './QRPage/QRPage';
import A2hs from './A2hs';
import ParentRedirectView from './ParentRegistration/MainView';
import RegistrationView from './ParentRegistration/RegistrationView';
import LogoutView from './ParentRegistration/LogoutView';
import { userTypes } from '../types/userTypes'
import { authTypes } from '../types/authTypes'
import { theme } from '../customizations'

import { isIos, isInStandaloneMode } from '../utils';
import { useTranslationsLoaded } from './translations'
import {useAppDispatch, useAppSelector} from "../store/getStore"

const Wrapper = styled.section`
  height: 100%;
  display: flex;
`;


export default function App() {
  const loggedIn = useAppSelector(state => state.auth.loggedIn)
  const token = useAppSelector(state => state.auth.token)
  const dispatch = useAppDispatch()

  const getUser = useCallback((token: string) => {
    dispatch({
      type: userTypes.GET_USER,
      payload: token
    })
  }, [dispatch])

  const authWithCache = useCallback(() => {
    dispatch({
      type: authTypes.AUTH_WITH_CACHE
    })
  }, [dispatch])

  const [showA2hs, setShowA2hs] = useState(false);
  const translationsLoaded = useTranslationsLoaded()

  useEffect(() => {
    if (loggedIn) {
      getUser(token)
    }
  }, [getUser, loggedIn, token]);

  //if token not in state / localStorage, check cache for a token (for iOs issue with adding to homescreen)
  useEffect(() => {
    if (!loggedIn) {
      authWithCache()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {translationsLoaded ? (
          <>
            <Routes>
              <Route path='/login' element={<LoginPage />} />
              <Route path='/' element={<LoginRequired><QRPage /></LoginRequired>} />
              <Route path='/hae' element={<ParentRedirectView />} />
              <Route path='/hakemus' element={<RegistrationView />} />
              <Route path='/uloskirjaus' element={<LogoutView />} />
            </Routes>
            <A2hs isVisible={showA2hs} close={onClose} />
          </>
        ) : null}
      </Wrapper>
    </ThemeProvider>
  );
}

const LoginRequired = React.memo(function LoginRequired({ children, }: { children: JSX.Element }) {
  const loggedIn = useAppSelector(state => state.auth.loggedIn)
  if (!loggedIn) {
    return <Navigate to="/login" />
  }
  return children
})
