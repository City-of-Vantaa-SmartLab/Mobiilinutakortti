import api from '../api';
import { CREATE, GET_ONE, HttpError } from 'react-admin';
import { parseErrorMessages } from '../utils';

export const messageProvider = (type, params, httpClient) => {
    let url;
    let options;
    switch (type) {
        case GET_ONE: {
            return {
                msgContent: '',
                recipient: undefined,
                youthClub: undefined
            }
        }
        case CREATE: {
            const data = JSON.stringify({
                msgContent: params.data.msgContent,
                recipient: params.data.recipient,
                youthClub: params.data.youthClub
            });
            url = api.info.sendMessage;
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
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    }
}
