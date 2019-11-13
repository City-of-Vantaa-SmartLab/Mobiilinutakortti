import api from './api';

export default (url, options = {}, refresh = true) => {
  options.headers = new Headers({ 'Content-Type': 'application/json' });
  let token = localStorage.getItem('token');
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }
  if (!refresh) {
    return fetch(url, options).then(res => res.json());
  }
  return refreshToken().then(
    refreshResponse => {
      const responseAsJson = refreshResponse.json();
      if (responseAsJson.statusCode < 200 || responseAsJson.statusCode >= 300) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        return Promise.resolve();
      }
    }
  ).then(({ access_token }) => {
    localStorage.setItem('token', access_token);
    token = access_token;
  }).then(() => {
    options.headers.set('Authorization', `Bearer ${access_token}`);
    fetch(url, options).then(res => res.json());
  });
}

const getHeaders = () => new Headers({ 'Content-Type': 'application/json' });

const refreshToken = () => {
  const url = api.youthWorker.refresh;
  const options = {
    method: 'GET',
    headers: getHeaders()
  }
  const token = localStorage.getItem('token');
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, options);
}
