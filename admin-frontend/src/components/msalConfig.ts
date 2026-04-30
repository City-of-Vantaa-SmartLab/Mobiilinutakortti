import { LogLevel } from '@azure/msal-browser'
import { getEnvConfig, ENV_VARS } from '../envConfig';

const authConfig = {
  auth: {
    clientId: getEnvConfig(ENV_VARS.VITE_ENTRA_CLIENT_ID),
    authority: `https://login.microsoftonline.com/${getEnvConfig(ENV_VARS.VITE_ENTRA_TENANT_ID)}`,
    redirectUri: getEnvConfig(ENV_VARS.VITE_ENTRA_REDIRECT_URI)
  },
  cache: {
    cacheLocation: 'sessionStorage',
    temporaryCacheLocation: 'sessionStorage'
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Info,
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
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

// For logout_hint to work during logout, 'openid' and 'profile' scopes are required according to documentation:
// https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/sign-out-of-openid-connect-oauth2-applications-without-user-selection-prompt
// For the login, scopes 'openid' and 'profile' were automatically included but we'll define them here anyway.
const loginRequestScopes = ['User.Read', 'openid', 'profile']

const tokenRequestScopes = [`api://${getEnvConfig(ENV_VARS.VITE_ENTRA_CLIENT_ID)}/user_login`]

export {
  authConfig,
  loginRequestScopes,
  tokenRequestScopes
}
