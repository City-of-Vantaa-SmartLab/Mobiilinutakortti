import * as MSAL from '@azure/msal-browser'
import * as MSALConfig from './msalConfig'

export class MSALApp {
    static instance;
    static appUsername;

    static async logout() {
        // Despite the code having hints suggesting so, it is not possible to select the account to be logged out
        // using parameters here due to DDOS threat. The user will be shown a prompt, asking which account they
        // would like to log out of.
        console.debug('Calling MSAL logout redirect.');
        await MSALApp.instance.logoutRedirect({
            postLogoutRedirectUri: process.env.REACT_APP_ENTRA_REDIRECT_URI
        });
    }

    static async initNew() {
        if (!!MSALApp.instance) {
            console.debug('MSALApp already initialized.');
            return;
        }

        MSALApp.instance = new MSAL.PublicClientApplication(MSALConfig.authConfig);
        await MSALApp.instance.initialize();
        const response = await MSALApp.instance.handleRedirectPromise();
        if (response) {
            MSALApp.appUsername = response.account.username;
        }
        console.debug('MSAL user: ' + MSALApp.appUsername);
    }

    static async login() {
        if (!MSALApp.instance) {
            console.error('MSALApp not initialized.');
            return;
        }
        // The "login" prompt attempts to always force asking for credentials when signing in.
        // This, however, depends ultimately on how Entra ID is configured.
        // Conditional Access per application is the recommended way to control login behavior.
        // https://learn.microsoft.com/en-us/entra/identity-platform/msal-js-prompt-behavior
        await MSALApp.instance.loginRedirect({
            scopes: MSALConfig.loginRequestScopes,
            prompt: 'login'
        });
    }

    static async getAuthorizationBearerToken() {
        if (!MSALApp.appUsername) {
            console.debug('User is not signed in.');
            return null;
        }

        MSALApp.instance.setActiveAccount(MSALApp.instance.getAccountByUsername(MSALApp.appUsername));
        const request = {
            scopes: MSALConfig.tokenRequestScopes
        }

        console.debug('Trying to acquire MSAL token silently.');
        return await MSALApp.instance.acquireTokenSilent(request).catch(async error => {
            if (error instanceof MSAL.InteractionRequiredAuthError) {
                console.log('Silent token acquisition fail, using redirect.');
                return MSALApp.instance.acquireTokenRedirect(request).catch(error => {
                    console.error(error);
                });
            } else {
                console.error(error);
            }
        });
    }
}
