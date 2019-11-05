import api from '../api';
import { GET_LIST } from 'react-admin';
import { parseErrorMessages } from '../utils';

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
                        throw {message: parseErrorMessages(response.message), status: response.statusCode};
                    }
                    return { data: response, total: response.length };
                });
        }
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    }
}