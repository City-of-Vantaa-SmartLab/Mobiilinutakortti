import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from './loginPage/loginPage';
import QRPage from './QRPage/QRPage';
const ParentRedirectView = React.lazy(() => import('./ParentRegistration/MainView'));
const RegistrationView = React.lazy(() => import('./ParentRegistration/RegistrationView'));
const LogoutView = React.lazy(() => import('./ParentRegistration/LogoutView'));
import { theme } from '../customizations'
import { useTranslationsLoaded } from './translations'
import { useAppSelector } from "../store/getStore"

export default function App() {
  const translationsLoaded = useTranslationsLoaded()

  return (
    <ThemeProvider theme={theme}>
      <section id="wrapper">
        {translationsLoaded ? (
          <React.Suspense fallback={null}>
            <Routes>
              <Route path='/login' element={<LoginPage />} />
              <Route path='/' element={<LoginRequired><QRPage /></LoginRequired>} />
              <Route path='/hae' element={<ParentRedirectView />} />
              <Route path='/hakemus' element={<RegistrationView />} />
              <Route path='/uloskirjaus' element={<LogoutView />} />
            </Routes>
          </React.Suspense>
        ) : null}
      </section>
    </ThemeProvider>
  );
}

const LoginRequired = React.memo(function LoginRequired({ children, }: { children: React.JSX.Element }) {
  const loggedIn = useAppSelector(state => state.auth.loggedIn)
  if (!loggedIn) {
    return <Navigate to="/login" />
  }
  return children
})
