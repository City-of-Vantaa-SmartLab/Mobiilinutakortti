import { httpClient } from './';
import api from '../api';
import { userTokenKey, adminUiBasePath } from '../utils';
import { AUTH_LOGOUT } from 'react-admin';
import { authProvider } from '../providers';

// If url parameter evaluates to false, there will be a token refresh but no other data fetch.
export const httpClientWithRefresh = async (url: string, options: RequestInit = {}) => {
    const refreshOptions = {
        method: 'GET',
        headers: new Headers({ 'Content-Type': 'application/json' })
    };
    const authToken = sessionStorage.getItem(userTokenKey);
    if (authToken) refreshOptions.headers.set('Authorization', `Bearer ${authToken}`);

    return fetch(api.youthWorker.refresh, refreshOptions).then(async refreshResponse => {
        const refreshData = await refreshResponse.json();
        if (refreshData.statusCode < 200 || refreshData.statusCode >= 300) {
            authProvider(AUTH_LOGOUT, {});
            document.location.href = adminUiBasePath;
            return Promise.resolve();
        } else {
            return refreshData;
        }
    }).then((data) => {
        if (!data) return;
        sessionStorage.setItem(userTokenKey, data.access_token);
        if (!url) return;
        return httpClient(url, options);
    });
};
