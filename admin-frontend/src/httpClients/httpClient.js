import { userToken } from '../utils';

export const httpClient = async (url, options = {}) => {
  options.headers = new Headers({ 'Content-Type': 'application/json' });
  const authToken = localStorage.getItem(userToken);
  if (authToken) {
    options.headers.set('Authorization', `Bearer ${authToken}`);
  }
  return fetch(url, options)
    .then(res => res.json())
}
