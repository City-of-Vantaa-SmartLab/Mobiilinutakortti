import api from '../api';
import { CREATE, DELETE, GET_LIST, GET_ONE } from 'react-admin';
import { newHttpErrorFromResponse } from '../utils';

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
                        throw newHttpErrorFromResponse(response);
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
                    entryPermitType: params.filter.entryPermitType,
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
                        throw newHttpErrorFromResponse(response);
                    }
                    return response;
                });
        }
        case CREATE: {
            const data = JSON.stringify({
                juniorId: params.data.juniorId,
                entryTypeId: params.data.entryTypeId,
                isPermit: params.data.isPermit
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
                        throw newHttpErrorFromResponse(response);
                    }
                    return { data: { id: '', message: response.message } } // React admin expects data as return value
                });
        }
        case DELETE: {
            const urlBase = params.data.isPermit ? api.extraEntry.deletePermit : api.extraEntry.delete;
            url = `${urlBase}/${params.data.deletableId}`;
            options = {
                method: 'DELETE'
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw newHttpErrorFromResponse(response);
                    }
                    return { data: { id: params.id } }
                });
        }
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    };
};
