import api from '../api';
import { GET_LIST, CREATE } from 'react-admin';

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
            url = api.junior.create;
            options = {
                method: 'POST',
                body: data,
                headers: { "Content-Type": "application/json" },
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.status < 200 || response.status >= 300) {
                        throw new Error(response.statusText);
                    }
                    return {data: {id: ''}} //React-admin expects this format from from CREATE. Hacky and ugly, but works.
                });
        }
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    }
}