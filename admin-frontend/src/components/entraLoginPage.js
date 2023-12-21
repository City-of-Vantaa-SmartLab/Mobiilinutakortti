import {
  Avatar,
  Button,
  Box,
  CssBaseline,
  Container,
  Typography,
  createTheme,
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { ThemeProvider } from '@material-ui/styles';
import { useEffect, useState } from 'react';
import { MSALApp } from './msalApp';
import { httpClient } from '../httpClients';
import api from '../api';
import { userToken, setUserInfo, checkLogoutMSAL } from '../utils';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5;',
    },
  },
  typography: {
    h6: {
      fontWeight: 400,
      fontSize: '18px',
      textAlign: 'center',
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          backgroundImage: 'url("/nuta-admin-bg.jpg")',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
        },
      },
    },
  },
});

export default function EntraLogin() {

  const [ userName, setUserName] = useState(null);
  const [ loginInProgress, setLoginInProgress] = useState(true);
  const [ logoutInProgress, setLogoutInProgress] = useState(false);

  useEffect(() => {
    const tryLogin = async () => {
      await MSALApp.initNew();
      console.debug("MSAL app initialized.");
      setUserName(MSALApp.appUsername);

      const checkLogout = localStorage.getItem(checkLogoutMSAL);
      if (checkLogout) {
        setLogoutInProgress(true);
        await MSALApp.logout();
      } else {
        if (!MSALApp.appUsername) {
          setLoginInProgress(false);
          return;
        }
        const token = await MSALApp.getAuthorizationBearerToken();
        if (token?.accessToken) {
          const { access_token } = await httpClient(
            api.auth.loginEntraID,
            { method: 'POST', body: JSON.stringify({ msalToken: token.accessToken }) }
          );

          localStorage.setItem(userToken, access_token);
          const userInfo = await httpClient(api.youthWorker.self, { method: 'GET' });
          setUserInfo(userInfo);

          // At this point the user is not signed out of MSAL.
          // We could sign them out, but it would result in a prompt for the user to choose which account they would like
          // to sign out of. This would be very confusing in the middle of a login process.
          // If it was possible to sign the user out quietly, this is where it should be done.

          // Go to landingPage.
          window.location.href = process.env.REACT_APP_ADMIN_FRONTEND_URL;
        }
      }
    }
    tryLogin();
  }, []);

  const handleSubmit = async (event) => {
    setLoginInProgress(true);
    event.preventDefault();
    await MSALApp.login();
    setLoginInProgress(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#FFFFFF',
            padding: 20,
            borderRadius: '4px',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Avatar style={{ backgroundColor: '#e91e63' }}>
              <LockOutlinedIcon />
            </Avatar>
          </Box>
          <Typography variant="h6">
            Tervetuloa Nutakortin nuorisotyöntekijän käyttöliittymään.
          </Typography>
          {!userName ?
            (<Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
              <Button
                type="submit"
                color="primary"
                size="large"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loginInProgress}
              >
                Kirjaudu Nutakorttiin
              </Button>
            </Box>) :
            (<Typography variant="caption">
              Kirjataan {logoutInProgress ? 'ulos' : 'sisään'} käyttäjätunnus {userName}...
            </Typography>)
          }
        </Box>
      </Container>
    </ThemeProvider>
  );
}
