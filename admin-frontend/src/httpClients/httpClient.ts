import { userTokenKey } from '../utils';

export const httpClient = async (url: string, options: RequestInit = {}) => {
  options.headers = new Headers({ 'Content-Type': 'application/json' });
  const authToken = sessionStorage.getItem(userTokenKey);
  if (authToken) {
    options.headers.set('Authorization', `Bearer ${authToken}`);
  }
  return fetch(url, options).then(res => res.json());
}
