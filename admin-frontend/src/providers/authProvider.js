import { AUTH_LOGIN, AUTH_ERROR, AUTH_CHECK, AUTH_LOGOUT, AUTH_GET_PERMISSIONS } from 'react-admin';
import { httpClient } from '../httpClients';
import api from '../api';
import { token } from '../utils';

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
                localStorage.setItem(token, access_token);
            })
            .then(() => httpClient(api.youthWorker.self, { method: 'GET' }))
            .then((response) => {
                localStorage.setItem('lastLoggedInAdminName', response.firstName);
                localStorage.setItem('lastLoggedInAdminMainYouthClubId', response.mainYouthClub || -1);
                if (response.isSuperUser) {
                    localStorage.setItem('role', 'SUPERADMIN');
                } else {
                    localStorage.setItem('role', 'ADMIN');
                }
                // Dirty hack; forces recalculation of custom routes based on user role inside App.js
                window.location.reload();
            })
    }
    if (type === AUTH_ERROR) {
        const status = params.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem(token);
            localStorage.removeItem('role');
            return Promise.reject();
        }
        return Promise.resolve()
    }
    if (type === AUTH_CHECK) {
        return localStorage.getItem(token) ? Promise.resolve() : Promise.reject();
    }
    if (type === AUTH_LOGOUT) {
        localStorage.removeItem(token);
        localStorage.removeItem('role');
        return Promise.resolve()
    }
    if (type === AUTH_GET_PERMISSIONS) {
        const role = localStorage.getItem('role')
        return role ? Promise.resolve(role) : Promise.reject();
    }
    return Promise.resolve();
}
