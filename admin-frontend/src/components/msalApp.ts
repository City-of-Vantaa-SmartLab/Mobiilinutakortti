import * as MSAL from '@azure/msal-browser'
import * as MSALConfig from './msalConfig'

export class MSALApp {
    static instance: MSAL.PublicClientApplication;
    static appUsername: string | undefined;

    // NOTE: to use the logout_hint parameter, you the login_hint optional claim must be configured according to:
    // https://learn.microsoft.com/en-gb/entra/identity-platform/v2-protocols-oidc#send-a-sign-out-request
    // Using the logout_hint parameter also seems to fix a bug where post_logout_redirect_uri was not redirecting the user:
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/5783
    static async logout(logoutHintValue?: string) {
        console.debug('Calling MSAL logout redirect.');
        const options: any = {
            postLogoutRedirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI
        };
        if (logoutHintValue) options.logoutHint = logoutHintValue;
        await MSALApp.instance.logoutRedirect(options);
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

        const account = MSALApp.instance.getAllAccounts().find(acc => acc.username === MSALApp.appUsername);
        if (account) {
            MSALApp.instance.setActiveAccount(account);
        }
        const request = {
            scopes: MSALConfig.tokenRequestScopes
        }

        console.debug('Trying to acquire MSAL token silently.');
        return await MSALApp.instance.acquireTokenSilent(request).catch(async (error: any) => {
            if (error instanceof MSAL.InteractionRequiredAuthError) {
                console.log('Silent token acquisition fail, using redirect.');
                return MSALApp.instance.acquireTokenRedirect(request).catch((error: any) => {
                    console.error(error);
                });
            } else {
                console.error(error);
            }
        });
    }
}
