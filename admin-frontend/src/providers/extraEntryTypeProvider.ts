import api from '../api';
import { newHttpErrorFromResponse } from '../utils';
import { httpClientWithRefresh } from '../httpClients';

export const extraEntryTypeProvider = {
    getList: async (_params: any) => {
        const url = api.extraEntry.typeList;
        const options = { method: 'GET' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: response, total: response.length };
    },

    getOne: async (params: any) => {
        const url = api.extraEntry.type + params.id;
        const options = { method: 'GET' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: response };
    },

    create: async (params: any) => {
        const data = JSON.stringify({
            expiryAge: params.data.expiryAge,
            name: params.data.name
        });

        const url = api.extraEntry.typeCreate;
        const options = {
            method: 'POST',
            body: data,
            headers: { "Content-Type": "application/json" },
        };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: response };
    },

    getMany: async (_params: any) => {
        throw new Error('GET_MANY not implemented for extraEntryType');
    },

    getManyReference: async (_params: any) => {
        throw new Error('GET_MANY_REFERENCE not implemented for extraEntryType');
    },

    update: async (_params: any) => {
        throw new Error('UPDATE not implemented for extraEntryType');
    },

    updateMany: async (_params: any) => {
        throw new Error('UPDATE_MANY not implemented for extraEntryType');
    },

    delete: async (_params: any) => {
        throw new Error('DELETE not implemented for extraEntryType');
    },

    deleteMany: async (_params: any) => {
        throw new Error('DELETE_MANY not implemented for extraEntryType');
    },
};
