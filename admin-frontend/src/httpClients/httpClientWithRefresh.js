import { httpClient } from './';
import api from '../api';
import { userTokenKey, appUrl } from '../utils';
import { AUTH_LOGOUT } from 'react-admin';
import { authProvider } from '../providers';

export const httpClientWithRefresh = async (url, options = {}, disableAuth = false) => {
    const refreshOptions = {
        method: 'GET',
        headers: new Headers({ 'Content-Type': 'application/json' })
    };
    const authToken = localStorage.getItem(userTokenKey);
    if (authToken) {
        refreshOptions.headers.set('Authorization', `Bearer ${authToken}`);
    }

    return fetch(api.youthWorker.refresh, refreshOptions).then(refreshResponse => {
        refreshResponse = refreshResponse.json();
        if (refreshResponse.statusCode < 200 || refreshResponse.statusCode >= 300) {
            authProvider(AUTH_LOGOUT, {});
            document.location.href = appUrl;
            return Promise.resolve();
        } else {
            return refreshResponse;
        }
    }).then(({ access_token }) => {
        if (!disableAuth) {
            localStorage.setItem(userTokenKey, access_token);
        }
        return httpClient(url, options);
    });
};
