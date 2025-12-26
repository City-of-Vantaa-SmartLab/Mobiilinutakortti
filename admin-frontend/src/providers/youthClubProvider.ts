import api from '../api';
import { newHttpErrorFromResponse } from '../utils';
import { httpClientWithRefresh } from '../httpClients';

export const youthClubProvider = {
    getList: async (_params: any) => {
        const url = api.youthClub.list;
        const options = { method: 'GET' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return {
            data: response.sort((a: any, b: any) => a.name.localeCompare(b.name, 'fi', { sensitivity: 'base' })),
            total: response.length
        };
    },

    getOne: async (params: any) => {
        const url = api.youthClub.base + params.id;
        const options = { method: 'GET' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: response };
    },

    update: async (params: any) => {
        // If all messages are deleted or otherwise empty, params.data returns the whole messages object as null:
        // this does not erase old messages, so we must set null to all fields
        const messages = params.data.messages ? {
            fi: params.data.messages.fi,
            en: params.data.messages.en,
            sv: params.data.messages.sv,
        } : {
            fi: null,
            en: null,
            sv: null,
        };

        const data = {
            id: params.data.id,
            active: params.data.active,
            messages: messages,
            kompassiIntegration: params.data.kompassiIntegration
        };

        const jsonData = JSON.stringify(data);
        const url = api.youthClub.edit;
        const options = {
            method: 'POST',
            body: jsonData,
            headers: { "Content-Type": "application/json" },
        };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data };
    },

    getMany: async (_params: any) => {
        throw new Error('GET_MANY not implemented for youthClub');
    },

    getManyReference: async (_params: any) => {
        throw new Error('GET_MANY_REFERENCE not implemented for youthClub');
    },

    create: async (_params: any) => {
        throw new Error('CREATE not implemented for youthClub');
    },

    updateMany: async (_params: any) => {
        throw new Error('UPDATE_MANY not implemented for youthClub');
    },

    delete: async (_params: any) => {
        throw new Error('DELETE not implemented for youthClub');
    },

    deleteMany: async (_params: any) => {
        throw new Error('DELETE_MANY not implemented for youthClub');
    },
};
