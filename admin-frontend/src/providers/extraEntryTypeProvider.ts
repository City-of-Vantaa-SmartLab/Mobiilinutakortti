import api from '../api';
import { CREATE, GET_LIST, GET_ONE } from 'react-admin';
import { newHttpErrorFromResponse } from '../utils';

export const extraEntryTypeProvider = (type, params, httpClient) => {
    let url;
    let options;
    switch (type) {
        case GET_ONE: {
            url = api.extraEntry.type + params.id;
            options = {
                method: 'GET'
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw newHttpErrorFromResponse(response);
                    }
                    return { data: response };
                });
        }
        case GET_LIST: {
            url = api.extraEntry.typeList;
            options = {
                method: 'GET',
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw newHttpErrorFromResponse(response);
                    }
                    return { data: response, total: response.length };
                });
        }
        case CREATE: {
            const data = JSON.stringify({
                expiryAge: params.data.expiryAge,
                name: params.data.name
            });
            url = api.extraEntry.typeCreate;
            options = {
                method: 'POST',
                body: data,
                headers: { "Content-Type": "application/json" },
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw newHttpErrorFromResponse(response);
                    };
                    return { data: { id: '' } }; // React admin expects data as return value
                });
        };
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    };
};
