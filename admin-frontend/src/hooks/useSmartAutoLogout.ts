import { useEffect, useRef, useCallback } from 'react';
import { httpClientWithRefresh } from '../httpClients';
import { userTokenKey, autoLogoutTimeoutMinutes } from '../utils';
import { authProvider } from '../providers';

// A sliding time window (so "smart") auto logout.
// Returns a refresh function to use in a component's onFocus, so e.g. in a form's input field.
// The use case for per-field moving auto logout time window is that a youth worker is talking on the phone (with a parent) while filling out the form or just browsing a single page.
// These phone calls may well last over half an hour, during which the page would auto logout, losing all the work done by the youth worker, even if they were still using the system.
// The useAutologout hook is per page, so do not use that if using useSmartAutoLogout.

export function useSmartAutoLogout() {

    const timeoutRef = useRef(null);

    const start = useCallback(() => {
        timeoutRef.current = logout();
    }, []);

    const smartRefresh = useCallback(() => {
        httpClientWithRefresh(null);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        start();
    }, [start]);

    useEffect(() => {
        start();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                console.debug(`Cleared smart auto logout timeout.`);
            }
        };
    }, [start]);

    return smartRefresh;
}

const logout = () => {
    const timeoutId = setTimeout(async () => {
        console.info('Logging out user by smart auto logout.');
        authProvider.logout({ automatic: true, auth_token: sessionStorage.getItem(userTokenKey) });
    }, autoLogoutTimeoutMinutes * 60000);
    console.debug(`Set smart auto logout of ${autoLogoutTimeoutMinutes} minutes.`);
    return timeoutId;
}
