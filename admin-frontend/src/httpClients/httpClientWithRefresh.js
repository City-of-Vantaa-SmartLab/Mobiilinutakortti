import { httpClient } from './';
import api from '../api';
import { userToken } from '../utils';
import { AUTH_LOGOUT } from 'react-admin';
import { authProvider } from '../providers';

export const httpClientWithRefresh = (url, options = {}, disableAuth = false) => {
    const refreshOptions = {
        method: 'GET',
        headers: new Headers({ 'Content-Type': 'application/json' })
    };
    const authToken = localStorage.getItem(userToken);
    if (authToken) {
        refreshOptions.headers.set('Authorization', `Bearer ${authToken}`);
    }

    return fetch(api.youthWorker.refresh, refreshOptions).then(refreshResponse => {
        refreshResponse = refreshResponse.json();
        if (refreshResponse.statusCode < 200 || refreshResponse.statusCode >= 300) {
            authProvider(AUTH_LOGOUT, {});
            if (process.env.REACT_APP_ADMIN_FRONTEND_URL) {
              document.location.href = process.env.REACT_APP_ADMIN_FRONTEND_URL;
            } else {
              window.location.reload();
            }
            return Promise.resolve();
        } else {
            return refreshResponse;
        }
    }).then(({ access_token }) => {
        if (!disableAuth) {
            localStorage.setItem(userToken, access_token);
        }
        return httpClient(url, options);
    });
};
