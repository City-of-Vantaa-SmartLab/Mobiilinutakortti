import { useEffect } from 'react';
import { AUTH_LOGOUT } from 'react-admin';
import { httpClient } from '../httpClients'
import api from '../api';
import { userToken } from '../utils';
import { authProvider } from '../providers';

function useAutoLogout(forceAlways = false) {
    const youthWorkerInactiveTime = 60000; // 10 minutes

    useEffect(() => {
        let validCheck = setInterval(async () => {
            const isEntraLoginPage =
                process.env.REACT_APP_ENTRA_TENANT_ID &&
                (window.location.href + '/').includes(process.env.REACT_APP_ENTRA_REDIRECT_URI);

            // The hash may change due to routing, so we check these inside the interval function.
            const isLoggedOutPage =
                isEntraLoginPage ||
                window.location.hash?.includes("login") ||
                window.location.hash?.includes("checkIn");

            const needsAutomaticLogout = forceAlways || !isLoggedOutPage;

            if (needsAutomaticLogout) {
                await httpClient(api.auth.check, { method: 'GET' }).then(async (response) => {
                    if (response.statusCode < 200 || response.statusCode >= 300 || response.result === false) {
                        console.debug("Validity check fail: logging out user.");
                        await authProvider(AUTH_LOGOUT, { automatic: true, auth_token: localStorage.getItem(userToken) });
                    }
                })
            } else
                // Remove the local session token in case the user has somehow reached this page being logged in.
                localStorage.removeItem(userToken);
        }, youthWorkerInactiveTime);

        return () => {
            clearInterval(validCheck);
            validCheck = null;
        }
    }, [forceAlways]);
}

export default useAutoLogout;
