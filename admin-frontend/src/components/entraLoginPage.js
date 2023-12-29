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
import { userToken, setUserInfo, checkLogoutMSAL, inProgressLogoutMSAL, logoutCheckInClubId } from '../utils';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5;',
    },
  },
  typography: {
    body2: {
      padding: '1rem 0'
    },
    caption: {
      color: 'red'
    }
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
  const [ errorState, setErrorState] = useState(false);

  useEffect(() => {
    const tryLogin = async () => {
      await MSALApp.initNew();
      console.debug("MSAL app initialized.");
      setUserName(MSALApp.appUsername);

      // If there is a stored checkInClubId, we are navigating to a QR reader check in page. We must logout beforehand.
      const storedCheckInClubId = sessionStorage.getItem(logoutCheckInClubId);
      const checkLogout = !!localStorage.getItem(checkLogoutMSAL) || !!storedCheckInClubId;
      if (checkLogout) {
        setLogoutInProgress(true);
        await MSALApp.logout();
        if (storedCheckInClubId && !localStorage.getItem(inProgressLogoutMSAL)) {
          sessionStorage.removeItem(logoutCheckInClubId);
          window.location.href = process.env.REACT_APP_ADMIN_FRONTEND_URL + '#/checkIn/' + storedCheckInClubId;
        }
      } else {
        if (!MSALApp.appUsername) {
          setLoginInProgress(false);
          return;
        }
        const token = await MSALApp.getAuthorizationBearerToken();
        if (token?.accessToken) {
          try {
            const { access_token } = await httpClient(
              api.auth.loginEntraID,
              { method: 'POST', body: JSON.stringify({ msalToken: token.accessToken }) }
            );
            localStorage.setItem(userToken, access_token);
            const userInfo = await httpClient(api.youthWorker.self, { method: 'GET' });
            setUserInfo(userInfo);
          } catch (error) {
            setErrorState(true);
            console.log(error);
            return;
          }

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
          <Typography variant="body1" align="center">
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
            (<Typography variant="body2" align="center">
              Kirjataan {logoutInProgress ? 'ulos' : 'sisään'} käyttäjätunnus {userName}...
            </Typography>)
          }
          <Box sx={{ m: 1 }}></Box>
          <Typography variant="subtitle1">
            Jos mitään ei tapahdu, kokeile <a href='/nuorisotyontekijat/loginEntraID'>virkistää</a> sivu.
          </Typography>
          <Box sx={{ m: 1 }}></Box>
          {errorState && (<>
            <Typography variant="caption">
              Virhe sisäänkirjautuessa. Virkistä sivu ja yritä uudelleen.
            </Typography>
            <Box sx={{ m: 1 }}></Box>
            <Typography variant="caption">
              Jos ongelma toistuu, varmista ylläpitäjältä, että sähköpostiosoitteesi ei ole käytössä jollain toisella tunnuksella Nutakortissa. Pyydä tällöin ylläpitäjää poistamaan vanha/ylimääräinen tunnus.
            </Typography>
          </>)}

        </Box>
      </Container>
    </ThemeProvider>
  );
}
