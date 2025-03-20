import api from '../api';
import { GET_LIST, CREATE, UPDATE, GET_ONE, DELETE } from 'react-admin';
import { newHttpErrorFromResponse } from '../utils';

export const youthWorkerProvider = (type, params, httpClient) => {
    let url;
    let options;
    switch (type) {
        case GET_LIST: {
            url = api.youthWorker.list;
            options = {
                method: 'GET'
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
                email: params.data.email,
                password: params.data.password,
                firstName: params.data.firstName,
                lastName: params.data.lastName,
                isAdmin: params.data.isAdmin,
                mainYouthClub: params.data.mainYouthClub,
            });
            url = api.youthWorker.create;
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
                    return { data: { id: '' } } //React-admin expects this format from from CREATE. Hacky and ugly, but works.
                });
        }
        case UPDATE: {
            const data = {
                id: params.data.id,
                email: params.data.email,
                //   password: params.data.password,
                firstName: params.data.firstName,
                lastName: params.data.lastName,
                isAdmin: params.data.isAdmin,
                mainYouthClub: params.data.mainYouthClub
            };
            const jsonData = JSON.stringify(data);
            url = api.youthWorker.edit;
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
                    return { data } //React-admin expects this format from from UPDATE. Hacky and ugly, but works.
                });
        }
        case GET_ONE: {
            // A fix to react-admins delete -> get_one bug:
            // Edit-page is refreshed after delete when id is already undefined, causing an unnecessary error
            const deletedItem = localStorage.getItem("deletedItem");
            localStorage.removeItem("deletedItem");
            if (params.id === deletedItem) {
                return Promise.reject();
            };
            url = api.youthWorker.base + params.id;
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
        case DELETE: {
            url = api.youthWorker.base + params.id;
            options = {
                method: 'DELETE'
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw newHttpErrorFromResponse(response);
                    }
                    localStorage.setItem("deletedItem", params.id)
                    return { data: { id: params.id } };
                });
        }
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    }
}
