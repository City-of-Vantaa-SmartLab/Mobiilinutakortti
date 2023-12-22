import * as MSAL from '@azure/msal-browser'
import * as MSALConfig from './msalConfig'
import { checkLogoutMSAL, doLogoutMSAL } from '../utils';

export class MSALApp {
    static instance;
    static appUsername;

    static async logout() {
        const account = MSALApp.instance.getActiveAccount();
        console.debug("MSALApp: account to log out: " + account?.username);
        let shouldLogout = !!account;

        if (!shouldLogout) {
            console.debug("MSALApp: nothing to log out.");
            localStorage.removeItem(checkLogoutMSAL);
            localStorage.removeItem(doLogoutMSAL);
            return;
        }

        if (!localStorage.getItem(doLogoutMSAL)) {
            localStorage.setItem(doLogoutMSAL, true);
            const request = {
                scopes: MSALConfig.tokenRequestScopes
            }
            // This call will end up reloading the page.
            await MSALApp.instance.acquireTokenSilent(request).catch(async error => {
                if (error instanceof MSAL.InteractionRequiredAuthError) {
                    // If interaction is required, that means the user must sign in again anyway, so no need to logout first.
                    console.debug("MSALApp: silent token acquire failed, interaction required.");
                    localStorage.removeItem(checkLogoutMSAL);
                    localStorage.removeItem(doLogoutMSAL);
                }
            });
        } else {
            localStorage.removeItem(checkLogoutMSAL);
            localStorage.removeItem(doLogoutMSAL);

            // Despite the code having hints suggesting so, it is not possible to select the account to be logged out
            // using parameters here due to DDOS threat. The user will be shown a prompt, asking which account they
            // would like to log out of.
            await MSALApp.instance.logoutRedirect({
                postLogoutRedirectUri: process.env.REACT_APP_ENTRA_REDIRECT_URI
            });
        }
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
        await MSALApp.instance.loginRedirect({
            scopes: MSALConfig.loginRequestScopes
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