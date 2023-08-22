import api from '../api';
import { CREATE, DELETE, GET_LIST, GET_ONE, HttpError } from 'react-admin';
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
            const field = params.sort.field === "age" ? "birthday" : params.sort.field;

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
                    field: field,
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
            const data = JSON.stringify({
                juniorId: params.data.juniorId,
                extraEntryTypeId: params.data.extraEntryTypeId
            });
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
                    }
                    return { data: { id: '' } } // React admin expects data as return value
                });
        }
        case DELETE: {
            url = `${api.extraEntry.delete}/${params.data.extraEntryId}`;
            options = {
                method: 'DELETE'
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw new HttpError(parseErrorMessages(response.message), response.statusCode);
                    }
                    return { data: { id: params.id } }
                });
        }
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    };
};
