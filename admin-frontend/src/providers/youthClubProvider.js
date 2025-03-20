import api from '../api';
import { GET_LIST, GET_ONE, UPDATE } from 'react-admin';
import { newHttpErrorFromResponse } from '../utils';

export const youthClubProvider = (type, params, httpClient) => {
    let url;
    let options;
    switch (type) {
        case GET_LIST: {
            url = api.youthClub.list;
            options = {
                method: 'GET'
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw newHttpErrorFromResponse(response);
                    }
                    return { data: response.sort((a,b) => a.name.localeCompare(b.name, 'fi', { sensitivity: 'base' })), total: response.length };
                });
        }
        case GET_ONE: {
            url = api.youthClub.base + params.id;
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
        case UPDATE: {
            // If all messages are deleted or otherwise empty, params.data returns the whole messages object as null:
            // this does not erase old messages, so we must set null to all fields
            const messages = params.data.messages ? {
                    fi: params.data.messages.fi,
                    en: params.data.messages.en,
                    sv: params.data.messages.sv,
                } : {
                    fi: null,
                    en: null,
                    sv: null,
            };
            const data = {
                id: params.data.id,
                active: params.data.active,
                messages: messages,
                kompassiIntegration: params.data.kompassiIntegration
            };
            const jsonData = JSON.stringify(data);
            url = api.youthClub.edit;
            options = {
                method: 'POST',
                body: jsonData,
                headers: { "Content-Type": "application/json" },
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw newHttpErrorFromResponse(response);
                    }
                    return { data }; // React admin expects data as return value
                });
        };
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    };
}
