import { AUTH_LOGIN, AUTH_ERROR, AUTH_CHECK, AUTH_LOGOUT, AUTH_GET_PERMISSIONS } from 'react-admin';
import { httpClient } from '../httpClients';
import api from '../api';
import { userToken } from '../utils';

const useEntraID = !!process.env.REACT_APP_ENTRA_TENANT_ID;

export const authProvider = (type, params) => {
    if (type === AUTH_LOGIN) {
        const url = useEntraID ? api.auth.loginEntraID : api.auth.login;

        // TODO: korvaa dummydata oikealla (token)
        const { username, password, dummydata } = params;
        console.log(dummydata);

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
                localStorage.setItem('userInfo', JSON.stringify({
                  firstName: response.firstName,
                  mainYouthClubId: response.mainYouthClub || -1,
                  passwordLastChanged: response.passwordLastChanged
                }));

                if (response.isAdmin) {
                    localStorage.setItem('role', 'ADMIN');
                } else {
                    localStorage.setItem('role', 'YOUTHWORKER');
                }
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
        // Remove userInfo here so that React doesn't try to load useEffect stuff in landing page.
        localStorage.removeItem('userInfo');
        const url = api.auth.logout;
        const options = {
            method: 'GET'
        };
        httpClient(url, options).then(() => {
          localStorage.removeItem(userToken);
          localStorage.removeItem('role');
          return Promise.resolve();
        })
    }
    if (type === AUTH_GET_PERMISSIONS) {
        const role = localStorage.getItem('role')
        return role ? Promise.resolve(role) : Promise.reject('Role not defined.');
    }
    return Promise.resolve();
}
