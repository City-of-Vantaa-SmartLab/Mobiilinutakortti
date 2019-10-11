
export default (url, options = {}) => {
  options.headers = new Headers({ 'Content-Type': 'application/json' });
  const token = localStorage.getItem('token');
  options.headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, options)
    .then((res) => res.json())
}
