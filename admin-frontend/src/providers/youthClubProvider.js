import api from '../api';
import { GET_LIST, HttpError } from 'react-admin';
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
                        throw new HttpError(parseErrorMessages(response.message), response.statusCode);
                    }
                    return { data: response.sort((a,b) => a.name.localeCompare(b.name, 'fi', { sensitivity: 'base' })), total: response.length };
                });
        }
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    }
}