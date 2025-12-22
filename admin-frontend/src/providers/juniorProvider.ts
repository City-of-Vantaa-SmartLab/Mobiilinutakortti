import api from '../api';
import { GET_LIST, CREATE, UPDATE, GET_ONE, DELETE } from 'react-admin';
import { newHttpErrorFromResponse } from '../utils';

export const juniorProvider = (type, params, httpClient) => {
    let url;
    let options;
    switch (type) {
        case GET_LIST: {
            url = api.junior.list;

            const controls = {
                filters: {
                    name: params.filter.name,
                    phoneNumber: params.filter.phoneNumber,
                    parentsPhoneNumber: params.filter.parentsPhoneNumber,
                    homeYouthClub: params.filter.homeYouthClub,
                    status: params.filter.status
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
                        throw newHttpErrorFromResponse(response);
                    }
                    return response;
                });
        }
        case CREATE: {
            const data = JSON.stringify({
                phoneNumber: params.data.phoneNumber,
                smsPermissionJunior: params.data.smsPermissionJunior,
                lastName: params.data.lastName,
                firstName: params.data.firstName,
                nickName: params.data.nickName,
                gender: params.data.gender,
                birthday: new Date(params.data.birthday),
                school: params.data.school,
                class: params.data.class,
                homeYouthClub: params.data.homeYouthClub,
                communicationsLanguage: params.data.communicationsLanguage,
                postCode: params.data.postCode,
                parentsName: params.data.parentsName,
                parentsPhoneNumber: params.data.parentsPhoneNumber,
                smsPermissionParent: params.data.smsPermissionParent,
                parentsEmail: params.data.parentsEmail,
                emailPermissionParent: params.data.emailPermissionParent,
                additionalContactInformation: params.data.additionalContactInformation,
                status: params.data.status,
                photoPermission: params.data.photoPermission
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
                        throw newHttpErrorFromResponse(response);
                    }
                    return { data: { id: '' } } //React-admin expects this format from from CREATE. Hacky and ugly, but works.
                });
        }
        case UPDATE: {
            const data = {
                id: params.data.id,
                phoneNumber: params.data.phoneNumber,
                smsPermissionJunior: params.data.smsPermissionJunior,
                lastName: params.data.lastName,
                firstName: params.data.firstName,
                nickName: params.data.nickName,
                gender: params.data.gender,
                birthday: new Date(params.data.birthday),
                school: params.data.school,
                class: params.data.class,
                homeYouthClub: params.data.homeYouthClub,
                communicationsLanguage: params.data.communicationsLanguage,
                postCode: params.data.postCode,
                parentsName: params.data.parentsName,
                parentsPhoneNumber: params.data.parentsPhoneNumber,
                smsPermissionParent: params.data.smsPermissionParent,
                parentsEmail: params.data.parentsEmail,
                emailPermissionParent: params.data.emailPermissionParent,
                additionalContactInformation: params.data.additionalContactInformation,
                status: params.data.status,
                photoPermission: params.data.photoPermission
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
                        throw newHttpErrorFromResponse(response);
                    }
                    return { data } //React-admin expects this format from from UPDATE. Hacky and ugly, but works.
                });
        }
        case GET_ONE: {
            // A fix to react-admins delete -> get_one bug:
            // Edit-page is refreshed after delete when id is already undefined, causing an unnecessary error
            const deletedItem = sessionStorage.getItem("deletedItem");
            sessionStorage.removeItem("deletedItem");
            if (params.id === deletedItem) {
                return Promise.reject();
            };
            url = api.junior.base + params.id;
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
            url = api.junior.base + params.id;
            options = {
                method: 'DELETE'
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw newHttpErrorFromResponse(response);
                    }
                    sessionStorage.setItem("deletedItem", params.id)
                    return { data: { id: params.id } }
                });
        }
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    }
}
