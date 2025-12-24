import {
  Avatar,
  Button,
  Box,
  CssBaseline,
  Container,
  Typography,
  createTheme,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { MSALApp } from './msalApp';
import { httpClient } from '../httpClients';
import api from '../api';
import { userTokenKey, setUserInfo, MSALAppLogoutInProgressKey, adminUiBasePath } from '../utils';

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
  components: {
    MuiCssBaseline: {
      styleOverrides: {
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
  const [ errorState, setErrorState] = useState(false);

  useEffect(() => {
    const tryLogin = async () => {
      try {
        await MSALApp.initNew();
        console.debug("MSAL app initialized.");
        setUserName(MSALApp.appUsername);
      } catch (error) {
        setErrorState(true);
        console.log(error);
        return;
      }

      // User has been prompted to log out from MSAL and this is a redirect after that.
      // User should have a valid session token by now. Continue to landingPage.
      if (sessionStorage.getItem(MSALAppLogoutInProgressKey)) {
          sessionStorage.removeItem(MSALAppLogoutInProgressKey);
          window.location.href = adminUiBasePath;
          return;
      } else {
        if (!MSALApp.appUsername) {
          sessionStorage.removeItem(MSALAppLogoutInProgressKey);
          setLoginInProgress(false);
          return;
        }

        const token = await MSALApp.getAuthorizationBearerToken();
        if (token?.accessToken) {
          try {
            const logoutHintValue = token?.idTokenClaims?.login_hint;
            const { access_token } = await httpClient(
              api.auth.loginEntraID,
              { method: 'POST', body: JSON.stringify({ msalToken: token.accessToken }) }
            );
            sessionStorage.setItem(userTokenKey, access_token);

            const userInfo = await httpClient(api.youthWorker.self, { method: 'GET' });
            setUserInfo(userInfo);

            sessionStorage.setItem(MSALAppLogoutInProgressKey, 'true');
            await MSALApp.logout(logoutHintValue);

          } catch (error) {
            setErrorState(true);
            console.log(error);
            return;
          }
        }
      }
    }
    tryLogin();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
              <Typography variant="body2" align="center">
                Entra ID -tilillä kirjautuessasi sinut myös kirjataan ulos kyseiseltä tililtä. Tämä on normaali osa sisäänkirjautumisprosessia.
              </Typography>
            </Box>) :
            (<Typography variant="body2" align="center">
              Kirjataan sisään käyttäjätunnus {userName}...
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
            {/* This is a thing that has actually happened: MSAL library didn't work if the browser wasn't recent enough. */}
            <Typography variant="caption">
              Jos ongelma toistuu, varmista ylläpitäjältä, että sähköpostiosoitteesi ei ole käytössä jollain toisella tunnuksella Nutakortissa. Pyydä tällöin ylläpitäjää poistamaan vanha/ylimääräinen tunnus. Koita myös päivittää selaimesi uusimpaan versioon.
            </Typography>
          </>)}

        </Box>
      </Container>
    </ThemeProvider>
  );
}
