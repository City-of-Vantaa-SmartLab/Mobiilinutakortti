import { adminToken } from '../utils';

export const httpClient = (url, options = {}) => {
  options.headers = new Headers({ 'Content-Type': 'application/json' });
  const authToken = localStorage.getItem(adminToken);
  if (authToken) {
    options.headers.set('Authorization', `Bearer ${authToken}`);
  }
  return fetch(url, options)
    .then(res => res.json())
}
