import api from '../api';
import { newHttpErrorFromResponse } from '../utils';
import { httpClientWithRefresh } from '../httpClients';

export const announcementProvider = {
    getList: async (params: any) => {
        const data = JSON.stringify({
            recipient: params.data.recipient,
            msgType: params.data.msgType,
            youthClub: params.data.sendToAllYouthClubs ? null : params.data.youthClub
        });

        const url = api.announcement.dryRun;
        const options = {
            method: 'POST',
            body: data,
            headers: { "Content-Type": "application/json" },
        };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: response.message };
    },

    getOne: async (_params: any) => {
        return {
            data: {
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
        };
    },

    create: async (params: any) => {
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
            youthClub: params.data.sendToAllYouthClubs ? null : params.data.youthClub
        });

        const url = api.announcement.create;
        const options = {
            method: 'POST',
            body: data,
            headers: { "Content-Type": "application/json" },
        };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: { id: Date.now(), message: response.message } };
    },

    getMany: async (_params: any) => {
        throw new Error('GET_MANY not implemented for announcement');
    },

    getManyReference: async (_params: any) => {
        throw new Error('GET_MANY_REFERENCE not implemented for announcement');
    },

    update: async (_params: any) => {
        throw new Error('UPDATE not implemented for announcement');
    },

    updateMany: async (_params: any) => {
        throw new Error('UPDATE_MANY not implemented for announcement');
    },

    delete: async (_params: any) => {
        throw new Error('DELETE not implemented for announcement');
    },

    deleteMany: async (_params: any) => {
        throw new Error('DELETE_MANY not implemented for announcement');
    },
};
