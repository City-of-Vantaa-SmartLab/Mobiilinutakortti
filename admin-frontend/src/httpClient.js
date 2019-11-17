import { token } from './utils';

export default (url, options = {}) => {
  options.headers = new Headers({ 'Content-Type': 'application/json' });
  const authToken = localStorage.getItem(token);
  if (authToken) {
    options.headers.set('Authorization', `Bearer ${authToken}`);
  }
  return fetch(url, options)
    .then(res => res.json())
}
