import { httpClient } from './';
import api from '../api';
import { userTokenKey, adminUiBasePath } from '../utils';
import { AUTH_LOGOUT } from 'react-admin';
import { authProvider } from '../providers';

// If url parameter evaluates to false, there will be a token refresh but no other data fetch.
export const httpClientWithRefresh = async (url, options = {}) => {
    const refreshOptions = {
        method: 'GET',
        headers: new Headers({ 'Content-Type': 'application/json' })
    };
    const authToken = sessionStorage.getItem(userTokenKey);
    if (authToken) refreshOptions.headers.set('Authorization', `Bearer ${authToken}`);

    return fetch(api.youthWorker.refresh, refreshOptions).then(refreshResponse => {
        refreshResponse = refreshResponse.json();
        if (refreshResponse.statusCode < 200 || refreshResponse.statusCode >= 300) {
            authProvider(AUTH_LOGOUT, {});
            document.location.href = adminUiBasePath;
            return Promise.resolve();
        } else {
            return refreshResponse;
        }
    }).then(({ access_token }) => {
        sessionStorage.setItem(userTokenKey, access_token);
        if (!url) return;
        return httpClient(url, options);
    });
};
