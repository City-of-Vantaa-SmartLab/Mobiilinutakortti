import defaultHttpClient from './httpClient';

export default (apiUrl, httpClient = defaultHttpClient) => {
  return (type, resource, params) => {
    return httpClient(apiUrl);
  }
};
