import { useEffect } from 'react';
import { userTokenKey, autoLogoutTimeoutMinutes } from '../utils';
import { authProvider } from '../providers';

// NB:
// * So that page changes trigger the useEffect, use auto logout in each relevant component, not just on App level.
// * The useLocation hook could be used if it worked outside React router, but due to react-admin it's difficult.
// * Therefore remember to use this hook inside any relevant components.

export const useAutoLogout = () => {
    useEffect(() => {
        const isEntraLoginPage =
            import.meta.env.VITE_ENTRA_TENANT_ID &&
            (window.location.href + '/').includes(import.meta.env.VITE_ENTRA_REDIRECT_URI);
        if (isEntraLoginPage) {
            return;
        }

        // NB: during manual logout, this message is shown even though interval is cleared immediately.
        console.debug(`Set auto logout of ${autoLogoutTimeoutMinutes} minutes.`);

        let logoutUser = setTimeout(async () => {
            // The hash may change due to routing, so we check these inside the interval function.
            // We should never end up here outside a component using auto logout, this is just in case.
            const isLoggedOutPage =
                isEntraLoginPage ||
                window.location.hash?.includes('login') || // non-Entra ID login page
                window.location.hash?.includes('checkIn'); // QR code reader page

            if (!isLoggedOutPage) {
                console.info('Logging out user automatically.');
                authProvider.logout({ automatic: true, auth_token: sessionStorage.getItem(userTokenKey) });
            } else
                // Remove the local session token in case the user has somehow reached this logged out page being logged in.
                sessionStorage.removeItem(userTokenKey);
        }, autoLogoutTimeoutMinutes * 60000);

        return () => {
            clearTimeout(logoutUser);
            console.debug(`Cleared auto logout timeout.`);
            logoutUser = null;
        }
    }, []);
}

export default useAutoLogout;
