import api from '../api';
import { GET_LIST, CREATE, UPDATE, GET_ONE, DELETE, HttpError } from 'react-admin';
import { parseErrorMessages } from '../utils';

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
                        throw new HttpError(parseErrorMessages(response.message), response.statusCode);
                    }
                    return { data: response, total: response.length };
                });
        }
        case CREATE: {
            const data = JSON.stringify({
                phoneNumber: params.data.phoneNumber,
                lastName: params.data.lastName,
                firstName: params.data.firstName,
                gender: params.data.gender,
                birthday: new Date(params.data.birthday),
                homeYouthClub: params.data.homeYouthClub,
                postCode: params.data.postCode,
                parentsName: params.data.parentsName,
                parentsPhoneNumber: params.data.parentsPhoneNumber
            });
            url = api.junior.create;
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
                    return { data: { id: '' } } //React-admin expects this format from from CREATE. Hacky and ugly, but works.
                });
        }
        case UPDATE: {
            const data = {
                id: params.data.id,
                phoneNumber: params.data.phoneNumber,
                lastName: params.data.lastName,
                firstName: params.data.firstName,
                gender: params.data.gender,
                birthday: new Date(params.data.birthday),
                homeYouthClub: params.data.homeYouthClub,
                postCode: params.data.postCode,
                parentsName: params.data.parentsName,
                parentsPhoneNumber: params.data.parentsPhoneNumber
            };
            const jsonData = JSON.stringify(data);
            url = api.junior.edit;
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
                    return { data } //React-admin expects this format from from UPDATE. Hacky and ugly, but works.
                });
        }
        case GET_ONE: {
            url = api.junior.base + params.id;
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
        case DELETE: {
            url = api.junior.base + params.id;
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
    }
}
