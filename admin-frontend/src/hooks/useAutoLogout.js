import { useEffect } from 'react';
import { AUTH_LOGOUT } from 'react-admin';
import { userToken } from '../utils';
import { authProvider } from '../providers';

// NB:
// * so that page changes trigger the useEffect use auto logout in each relevant component, not just on App level
// * useLocation could be used if it worked outside React router, but due to react-admin it's hard
// * therefore remember to use this hook inside any relevant components.

function useAutoLogout() {
    // This should be kept more or less the same as youthWorkerExpiry authentication const in backend.
    const inactiveMinutes = 15;
    const youthWorkerInactiveTime = inactiveMinutes * 60000;

    useEffect(() => {
        const isEntraLoginPage =
            process.env.REACT_APP_ENTRA_TENANT_ID &&
            (window.location.href + '/').includes(process.env.REACT_APP_ENTRA_REDIRECT_URI);
        if (isEntraLoginPage) {
            return;
        }

        // NB: during manual logout, this message is shown even though interval is cleared immediately.
        console.info(`Set auto logout of ${inactiveMinutes} minutes.`);

        let logoutUser = setInterval(async () => {
            // The hash may change due to routing, so we check these inside the interval function.
            // We should never end up here outside a component using auto logout, this is just in case.
            const isLoggedOutPage =
                isEntraLoginPage ||
                window.location.hash?.includes('login') || // non-Entra ID login page
                window.location.hash?.includes('checkIn'); // QR code reader page

            if (!isLoggedOutPage) {
                console.info('Automatically logging out user.');
                authProvider(AUTH_LOGOUT, { automatic: true, auth_token: localStorage.getItem(userToken) });
            } else
                // Remove the local session token in case the user has somehow reached this logged out page being logged in.
                localStorage.removeItem(userToken);
        }, youthWorkerInactiveTime);

        return () => {
            clearInterval(logoutUser);
            logoutUser = null;
        }
    }, [youthWorkerInactiveTime]);
}

export default useAutoLogout;
