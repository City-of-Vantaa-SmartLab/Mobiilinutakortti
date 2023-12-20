import * as MSAL from '@azure/msal-browser'
import * as MSALConfig from './msalConfig'

export class MSALApp {
    static instance;
    static appUsername;

    static async logout() {
        // Despite the code having hints suggesting so, it is not possible to select the account to be logged out
        // using parameters here due to DDOS threat. The user will be shown a prompt, asking which account they
        // would like to log out of.
        await MSALApp.instance.logoutRedirect({
            postLogoutRedirectUri: process.env.REACT_APP_ADMIN_FRONTEND_URL, // Redirects user to landingPage.
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
            console.debug("MSAL response: true");
            MSALApp.appUsername = response.account.username;
        }
        console.debug('User: ' + MSALApp.appUsername);
    }

    static login() {
        if (!MSALApp.instance) {
            console.error('MSALApp not initialized.');
            return;
        }
        MSALApp.instance.loginRedirect({
            scopes: MSALConfig.loginRequestScopes,
            extraQueryParameters: {
                max_age: 600, // Request a 10 minute lifetime, the minimum.
            }
        });
    }

    static async getAuthorizationBearerToken() {
        if (!MSALApp.appUsername) {
            console.debug('User is not signed in.');
            return null;
        }

        const request = {
            account: MSALApp.instance.getAccountByUsername(MSALApp.appUsername),
            scopes: MSALConfig.tokenRequestScopes
        }

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
