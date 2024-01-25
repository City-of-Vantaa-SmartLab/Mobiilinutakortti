import { useEffect } from 'react';
import { AUTH_LOGOUT } from 'react-admin';
import { userToken } from '../utils';
import { authProvider } from '../providers';

function useAutoLogout() {
    // This should be kept more or less the same as youthWorkerExpiry authentication const in backend.
    const youthWorkerInactiveTime = 900000; // 15 minutes

    useEffect(() => {
        const isEntraLoginPage =
            process.env.REACT_APP_ENTRA_TENANT_ID &&
            (window.location.href + '/').includes(process.env.REACT_APP_ENTRA_REDIRECT_URI);
        if (isEntraLoginPage) {
            return;
        }

        let logoutUser = setInterval(async () => {
            // The hash may change due to routing, so we check these inside the interval function.
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
    }, []);
}

export default useAutoLogout;
