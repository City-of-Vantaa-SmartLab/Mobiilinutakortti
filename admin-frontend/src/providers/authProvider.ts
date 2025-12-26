import type { AuthProvider } from 'react-admin';
import { httpClient } from '../httpClients';
import api from '../api';
import { userTokenKey, setUserInfo, clearUserInfo, loginFragment } from '../utils';
import { newHttpErrorFromResponse } from '../utils';

export const authProvider: AuthProvider = {
    login: async (params: any) => {
        const url = api.auth.login;
        const { username, password } = params;

        const options = {
            method: 'POST',
            body: JSON.stringify({ email: username, password }),
        };

        try {
            const response = await httpClient(url, options);
            if (response.statusCode < 200 || response.statusCode >= 300) {
                throw newHttpErrorFromResponse(response);
            }
            sessionStorage.setItem(userTokenKey, response.access_token);
            const userResponse = await httpClient(api.youthWorker.self, { method: 'GET' });
            setUserInfo(userResponse);
            // Forces recalculation of routes based on user role inside App.tsx.
            // If a youth worker was logged in and switches to an admin user (or vice versa),
            // the latter user would not see correct routes.
            window.location.reload();
        } catch (error) {
            throw error;
        }
    },

    logout: async (params: any) => {
        // Auth token may be given on automatic logout, since the provider mechanism (apparently) has already removed it.
        // At this point the token is already expired but still required by backend.
        const automatic = params?.automatic;
        const auth_token = params?.auth_token;
        if (auth_token) sessionStorage.setItem(userTokenKey, auth_token);

        // Clear userInfo here so that React doesn't try to load useEffect stuff in landing page.
        clearUserInfo();

        const url = !!automatic ? api.auth.autologout : api.auth.logout;
        const options = {
            method: 'GET'
        }

        const useEntraID = !!import.meta.env.VITE_ENTRA_TENANT_ID;
        const cleanup = () => {
            sessionStorage.removeItem(userTokenKey);
            sessionStorage.removeItem('role');
            window.location.href = useEntraID ?
                import.meta.env.VITE_ENTRA_REDIRECT_URI :
                loginFragment;
        }

        await httpClient(url, options).then(cleanup, cleanup);
    },

    checkAuth: async (_params: any) => {
        if (!sessionStorage.getItem(userTokenKey)) {
            throw new Error('Not authenticated');
        }
    },

    checkError: async (error) => {
        const status = error?.status;
        if (status === 401 || status === 403) {
            sessionStorage.removeItem(userTokenKey);
            sessionStorage.removeItem('role');
            throw error;
        }
    },

    getPermissions: async (_params: any) => {
        // Allow opening the check-in QR reader page for convenience.
        if (window.location.hash !== '#/checkIn') {
            const role = sessionStorage.getItem('role');
            if (!role) {
                console.info('Role not defined.');
                return '';
            }
            return role;
        }
    }
};
