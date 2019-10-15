import defaultHttpClient from '../httpClient';
import api from '../api';
import { GET_LIST, CREATE, GET_ONE, UPDATE } from 'ra-core';

export default (type, resource, params) => {
    let url;
    let options;
    switch (type) {
        case GET_LIST: {
            url = api.juniorList;
            options = {
                method: 'GET'
            };
            return defaultHttpClient(url, options)
                .then(response => {
                    if (response.status < 200 || response.status >= 300) {
                        throw new Error(response.statusText);
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
                age: params.data.age,
                homeYouthClub: params.data.homeYouthClub,
                postCode: params.data.postCode,
                parentsName: params.data.parentsName,
                parentsPhoneNumber: params.data.parentsPhoneNumber
            });
            url = api.juniorCreate;
            options = {
                method: 'POST',
                body: data,
                headers: { "Content-Type": "application/json" },
            };
            return defaultHttpClient(url, options)
                .then(response => {
                    console.log(response);
                    if (response.status < 200 || response.status >= 300) {
                        throw new Error(response.statusText);
                    }
                });
        }
        case GET_ONE: {
            url = api.juniorList;
            options = {
                method: 'GET'
            };
            return defaultHttpClient(url, options)
                .then(response => {
                    if (response.status < 200 || response.status >= 300) {
                        throw new Error(response.statusText);
                    }
                    return { data: response.find(e => e.id === params.id) };
                });
        }
        case UPDATE: {
            const data = JSON.stringify({
                id: params.data.id,
                phoneNumber: params.data.phoneNumber,
                lastName: params.data.lastName,
                firstName: params.data.firstName,
                gender: params.data.gender,
                age: params.data.age,
                homeYouthClub: params.data.homeYouthClub,
                postCode: params.data.postCode,
                parentsName: params.data.parentsName,
                parentsPhoneNumber: params.data.parentsPhoneNumber
            });
            url = api.juniorEdit;
            options = {
                method: 'POST',
                body: data,
                headers: { "Content-Type": "application/json" },
            };
            return defaultHttpClient(url, options)
                .then(response => {
                    const res = JSON.parse(res);
                    console.log(res);
                    if (response.status < 200 || response.status >= 300) {
                        throw new Error(response.statusText);
                    }
                    // return { data: response.find(e => e.id === params.id) };
                });
        }
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    }
}