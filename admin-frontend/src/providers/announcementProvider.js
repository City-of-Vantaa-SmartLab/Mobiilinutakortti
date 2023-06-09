import api from '../api';
import { CREATE, GET_ONE, HttpError } from 'react-admin';
import { parseErrorMessages } from '../utils';

export const announcementProvider = (type, params, httpClient) => {
    let url;
    let options;
    switch (type) {
        case GET_ONE: {
            return {
                content: {
                    fi: '',
                    en: '',
                    sv: ''
                },
                title: {
                    fi: '',
                    en: '',
                    sv: ''
                },
                recipient: undefined,
                msgType: undefined,
                youthClub: undefined
            }
        }
        case CREATE: {
            // If all language versions of content and title are deleted or otherwise empty, params.data returns the whole title and content objects as null:
            // this does not erase old contents, so we must set null to all fields
            const contents = params.data.content ? {
                    fi: params.data.content.fi,
                    en: params.data.content.en,
                    sv: params.data.content.sv,
                } : {
                    fi: null,
                    en: null,
                    sv: null,
            };
            const titles = params.data.title ? {
                    fi: params.data.title.fi,
                    en: params.data.title.en,
                    sv: params.data.title.sv,
                } : {
                    fi: null,
                    en: null,
                    sv: null,
            };
            const data = JSON.stringify({
                content: contents,
                title: titles,
                recipient: params.data.recipient,
                msgType: params.data.msgType,
                youthClub: params.data.youthClub
            });
            url = api.announcement.create;
            options = {
                method: 'POST',
                body: data,
                headers: { "Content-Type": "application/json" },
            };
            return httpClient(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw new HttpError(parseErrorMessages(response.message), response.statusCode);
                    };
                    return { data: { id: '' } }; // React admin expects data as return value
                });
        };
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    };
};
