import { useEffect } from 'react';
import { AUTH_LOGOUT } from 'react-admin';
import { userTokenKey } from '../utils';
import { authProvider } from '../providers';

// NB:
// * So that page changes trigger the useEffect, use auto logout in each relevant component, not just on App level.
// * The useLocation hook could be used if it worked outside React router, but due to react-admin it's difficult.
// * Therefore remember to use this hook inside any relevant components.

// This should be kept more or less the same as youthWorkerExpiry authentication const in backend.
const inactiveMinutesLimit = 15;

function useAutoLogout() {
    useEffect(() => {
        const isEntraLoginPage =
            process.env.REACT_APP_ENTRA_TENANT_ID &&
            (window.location.href + '/').includes(process.env.REACT_APP_ENTRA_REDIRECT_URI);
        if (isEntraLoginPage) {
            return;
        }

        // NB: during manual logout, this message is shown even though interval is cleared immediately.
        console.info(`Set auto logout of ${inactiveMinutesLimit} minutes.`);

        let logoutUser = setTimeout(async () => {
            // The hash may change due to routing, so we check these inside the interval function.
            // We should never end up here outside a component using auto logout, this is just in case.
            const isLoggedOutPage =
                isEntraLoginPage ||
                window.location.hash?.includes('login') || // non-Entra ID login page
                window.location.hash?.includes('checkIn'); // QR code reader page

            if (!isLoggedOutPage) {
                console.info('Automatically logging out user.');
                authProvider(AUTH_LOGOUT, { automatic: true, auth_token: sessionStorage.getItem(userTokenKey) });
            } else
                // Remove the local session token in case the user has somehow reached this logged out page being logged in.
                sessionStorage.removeItem(userTokenKey);
        }, inactiveMinutesLimit * 60000);

        return () => {
            clearTimeout(logoutUser);
            logoutUser = null;
        }
    }, []);
}

// To get per-field auto logout refresh, we can't use the useAutoLogout hook. Use this function instead where applicable.
// Use the parameter elementIdToCheck to check whether there's an element with given id and the timeout is still relevant or not.
// Since these timeouts are supposed to be used outside of React context, they probably are ticking in the background and some point.
const logoutWithId = (elementIdToCheck) => {
    const timeoutId = setTimeout(async () => {
        if (!document.getElementById(elementIdToCheck)) return;
        console.info('Automatically logging out user.');
        authProvider(AUTH_LOGOUT, { automatic: true, auth_token: sessionStorage.getItem(userTokenKey) });
    }, inactiveMinutesLimit * 60000);
    console.info(`Set id-based auto logout of ${inactiveMinutesLimit} minutes.`);
    return timeoutId;
}

export {
    logoutWithId,
    useAutoLogout
}

export default useAutoLogout;
