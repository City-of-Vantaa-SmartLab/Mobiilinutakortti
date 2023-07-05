import api from '../api';
import { CREATE, GET_LIST, GET_ONE, HttpError } from 'react-admin';
import { parseErrorMessages } from '../utils';

export const extraEntryProvider = (type, params, httpClient) => {
    let url;
    let options;
    switch (type) {
        case GET_ONE: {
            url = api.extraEntry + params.id;
            options = {
                method: 'GET'
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw new HttpError(parseErrorMessages(response.message), response.statusCode);
                    }
                    return { data: response };
            });        
        }
        case GET_LIST: {
            url = api.extraEntry.list;
            
            const controls = {
                filters: {
                    name: params.filter.name,
                    phoneNumber: params.filter.phoneNumber,
                    extraEntryType: params.filter.extraEntryType,
                },
                pagination: {
                    page: params.pagination.page,
                    perPage: params.pagination.perPage
                },
                sort: {
                    field: params.sort.field,
                    order: params.sort.order
                }
            };

            options = {
                method: 'GET',
            };

            url += `?controls=${encodeURIComponent(JSON.stringify(controls))}`
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw new HttpError(parseErrorMessages(response.message), response.statusCode);
                    }
                    return response;
                });
        }
        case CREATE: {
            const data = JSON.stringify({});
            url = api.extraEntry.create;
            options = {
                method: 'POST',
                body: data,
                headers: { "Content-Type": "application/json" },
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw new HttpError(parseErrorMessages(response.message), response.statusCode);
                    };
                    return { data: { id: '' } }; // React admin expects data as return value
                });
        };
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    };
};
