import api from '../api';
import { GET_LIST, GET_ONE, HttpError, UPDATE } from 'react-admin';
import { parseErrorMessages } from '../utils';

export const extraEntryProvider = (type, params, httpClient) => {
    let url;
    let options;
    switch (type) {
        case GET_ONE: {
            url = api.extraEntry.base + params.id;
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
        case UPDATE: {
            const data = {
                id: params.data.id,
                phoneNumber: params.data.phoneNumber,
                lastName: params.data.lastName,
                firstName: params.data.firstName,
                nickName: params.data.nickName,
                birthday: new Date(params.data.birthday),
                extraEntries: params.data.extraEntries,
            };
            const jsonData = JSON.stringify(data);
            url = api.extraEntry.edit;
            options = {
                method: 'POST',
                body: jsonData,
                headers: { "Content-Type": "application/json" },
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw new HttpError(parseErrorMessages(response.message), response.statusCode);
                    }
                    return { data } // React admin expects data as return value
                });
        }
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    };
};
