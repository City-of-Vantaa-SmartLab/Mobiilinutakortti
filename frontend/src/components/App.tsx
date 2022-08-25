import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from './loginPage/loginPage';
import QRPage from './QRPage/QRPage';
import ParentRedirectView from './ParentRegistration/MainView';
import RegistrationView from './ParentRegistration/RegistrationView';
import LogoutView from './ParentRegistration/LogoutView';
import { theme } from '../customizations'
import { useTranslationsLoaded } from './translations'
import { useAppSelector } from "../store/getStore"

const Wrapper = styled.section`
  height: 100%;
  display: flex;
`;


export default function App() {
  const translationsLoaded = useTranslationsLoaded()

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
