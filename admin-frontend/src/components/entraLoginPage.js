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
import { userToken, setUserInfo } from '../utils';

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

  useEffect(() => {
    const tryLogin = async () => {
      await MSALApp.initNew();
      console.debug("MSAL app initialized.");
      if (!MSALApp.appUsername) {
        setLoginInProgress(false);
        return;
      }
      setUserName(MSALApp.appUsername);

      const token = await MSALApp.getAuthorizationBearerToken();
      if (token?.accessToken) {
        const { access_token } = await httpClient(
          api.auth.loginEntraID,
          { method: 'POST', body: JSON.stringify({ msalToken: token.accessToken }) }
        );

        await MSALApp.logout();
        sessionStorage.clear();
        localStorage.setItem(userToken, access_token);

        const userInfo = await httpClient(api.youthWorker.self, { method: 'GET' });
        setUserInfo(userInfo);
        window.location.href = process.env.REACT_APP_ADMIN_FRONTEND_URL; // Go to landingPage.
      }
    }
    tryLogin();
  }, []);

  const handleSubmit = (event) => {
    setLoginInProgress(true);
    event.preventDefault();
    MSALApp.login();
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
              Kirjaudutaan sisään käyttäjätunnuksella {userName}...
            </Typography>)
          }
        </Box>
      </Container>
    </ThemeProvider>
  );
}
