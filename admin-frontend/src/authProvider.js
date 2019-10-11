import { AUTH_LOGIN } from 'react-admin';
import defaultHttpClient from './httpClient';
import api from './api'

export default (type, params) => {
  if (type === AUTH_LOGIN) {
    const url = api.adminLogin;
    const { username, password } = params;
    const options = {
        method: 'POST',
        body: JSON.stringify({ email: username, password }),
    };
    return defaultHttpClient(url, options)
        .then(response => {
            if (response.status < 200 || response.status >= 300) {
                throw new Error(response.statusText);
            }
            return response;
        })
        .then(({ access_token }) => {
            localStorage.setItem('token', access_token);
        });
  }
  return Promise.resolve();
}
