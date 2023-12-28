import { LogLevel } from '@azure/msal-browser'

const authConfig = {
  auth: {
    clientId: process.env.REACT_APP_ENTRA_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_ENTRA_TENANT_ID}`,
    redirectUri: process.env.REACT_APP_ENTRA_REDIRECT_URI
  },
  cache: {
    cacheLocation: 'sessionStorage',
    temporaryCacheLocation: 'sessionStorage'
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Info,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            console.log("Unknown LogLevel.");
        }
      }
    }
  }
}

const loginRequestScopes = ['User.Read']

const tokenRequestScopes = [`api://${process.env.REACT_APP_ENTRA_CLIENT_ID}/user_login`]

export {
  authConfig,
  loginRequestScopes,
  tokenRequestScopes
}
