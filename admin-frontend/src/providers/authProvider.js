import { AUTH_LOGIN, AUTH_ERROR, AUTH_CHECK, AUTH_LOGOUT, AUTH_GET_PERMISSIONS } from 'react-admin';
import { httpClient } from '../httpClients';
import api from '../api';
import { userToken, setUserInfo, clearUserInfo, MSALAppCheckIfLogoutNeeded } from '../utils';

export const authProvider = (type, params) => {
    if (type === AUTH_LOGIN) {
        const url = api.auth.login;
        const { username, password } = params;

        const options = {
            method: 'POST',
            body: JSON.stringify({ email: username, password }),
        };
        return httpClient(url, options)
            .then(response => {
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    throw new Error(response.message);
                }
                return response;
            })
            .then(({ access_token }) => {
                localStorage.setItem(userToken, access_token);
            })
            .then(() => httpClient(api.youthWorker.self, { method: 'GET' }))
            .then((response) => {
                setUserInfo(response);
                // Forces recalculation of custom routes based on user role inside App.js.
                // This is made so that if a youth worker was logged in on the same browser that an admin now uses to log in,
                // the admin would not see all the admin pages since the routes were calculated for the previous user (with only youth worker permissions).
                // This also works vice versa.
                window.location.reload();
            })
    }
    if (type === AUTH_ERROR) {
        const status = params.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem(userToken);
            localStorage.removeItem('role');
            return Promise.reject();
        }
        return Promise.resolve()
    }
    if (type === AUTH_CHECK) {
        return localStorage.getItem(userToken) ? Promise.resolve() : Promise.reject();
    }
    if (type === AUTH_LOGOUT) {
        // Auth token may be given on automatic logout, since the provider mechanism (apparently) has already removed it.
        // At this point the token is already expired but still required by backend.
        const automatic = params?.automatic;
        const auth_token = params?.auth_token;
        if (auth_token) localStorage.setItem(userToken, auth_token);

        // Clear userInfo here so that React doesn't try to load useEffect stuff in landing page.
        clearUserInfo();

        const useEntraID = !!process.env.REACT_APP_ENTRA_TENANT_ID;
        // Set this so MSAL logout will be triggered in login page.
        if (useEntraID) {
            console.debug("Will check MSAL logout need.");
            localStorage.setItem(MSALAppCheckIfLogoutNeeded, true);
        }

        const url = !!automatic ? api.auth.autologout : api.auth.logout;
        const options = {
            method: 'GET'
        };
        const cleanup = () => {
            localStorage.removeItem(userToken);
            localStorage.removeItem('role');
            window.location.href = useEntraID ?
                process.env.REACT_APP_ENTRA_REDIRECT_URI :
                process.env.REACT_APP_ADMIN_FRONTEND_URL + '#/login';
        };
        httpClient(url, options).then(cleanup, cleanup);
    }
    if (type === AUTH_GET_PERMISSIONS) {
        const role = localStorage.getItem('role')
        return role ? Promise.resolve(role) : Promise.reject('Role not defined.');
    }
    return Promise.resolve();
}
