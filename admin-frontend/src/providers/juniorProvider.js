import api from '../api';
import { GET_LIST } from 'ra-core';

export const juniorProvider = (type, params, httpClient) => {
    let url;
    let options;
    switch (type) {
        case GET_LIST: {
            url = api.junior.list;
            options = {
                method: 'GET'
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw new Error(response.statusText);
                    }
                    return { data: response, total: response.length };
                });
        }
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    }
}