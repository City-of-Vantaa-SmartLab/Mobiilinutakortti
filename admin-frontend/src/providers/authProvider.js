import { AUTH_LOGIN, AUTH_ERROR, AUTH_CHECK, AUTH_LOGOUT, AUTH_GET_PERMISSIONS } from 'react-admin';
import defaultHttpClient from '../httpClient';
import api from '../api'

export const authProvider = (type, params) => {
    if (type === AUTH_LOGIN) {
        const url = api.auth.login;
        const { username, password } = params;
        const options = {
            method: 'POST',
            body: JSON.stringify({ email: username, password }),
        };
        return defaultHttpClient(url, options)
            .then(response => {
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    throw new Error(response.message);
                }
                return response;
            })
            .then(({ access_token }) => {
                localStorage.setItem('token', access_token);
            });
    }
    if (type === AUTH_ERROR) {
        const status = params.statusCode;
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            return Promise.reject();
        }
    }
    if (type === AUTH_CHECK) {
        return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
    }
    if (type === AUTH_LOGOUT) {
        localStorage.removeItem('token');
        return Promise.resolve()
    }
    if (type === AUTH_GET_PERMISSIONS) {
        const role = 'SUPERADMIN' //TODO: Change to proper implementation once backend work is done.
        return role ? Promise.resolve(role) : Promise.reject();
    }
    return Promise.resolve();
}
