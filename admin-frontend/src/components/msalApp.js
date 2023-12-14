import * as MSAL from '@azure/msal-browser'
import * as MSALConfig from './msalConfig'

export class MSALApp {
    static instance;
    static appUsername;

    static setUsernameFromAccounts() {
        const accounts = MSALApp.instance.getAllAccounts();
        if (accounts.length > 0) {
            MSALApp.appUsername = accounts[0].username;
            if (accounts.length > 1) {
                console.warn('Multiple accounts detected. Selected first one.');
                console.debug(accounts);
            }
        }
    }

    static async initNew() {
        if (!!MSALApp.instance) {
            console.debug('MSALApp already initialized.');
            return;
        }

        MSALApp.instance = new MSAL.PublicClientApplication(MSALConfig.authConfig);
        await MSALApp.instance.initialize();
        this.setUsernameFromAccounts();

        const response = await MSALApp.instance.handleRedirectPromise();
        if (response) {
            console.debug("MSAL response: true");
            MSALApp.appUsername = response.account.username;
        } else {
            console.debug("MSAL response: false");
            this.setUsernameFromAccounts();
        }
        console.debug('User: ' + MSALApp.appUsername);
    }

    static login() {
        if (!MSALApp.instance) {
            console.error('MSALApp not initialized.');
            return;
        }
        MSALApp.instance.loginRedirect({
            scopes: MSALConfig.loginRequestScopes
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
