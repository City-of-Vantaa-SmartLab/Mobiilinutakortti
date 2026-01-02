import api from '../api';
import { newHttpErrorFromResponse } from '../utils';
import { httpClientWithRefresh } from '../httpClients';

export const eventProvider = {
    getList: async (_params: any) => {
        const url = api.event.list;
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
        const url = api.event.base + params.id;
        const options = { method: 'GET' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: response };
    },

    update: async (params: any) => {
        const data = {
            id: params.data.id,
            name: params.data.name,
            description: params.data.description || null,
            startDate: params.data.startDate || null,
            integrationId: params.data.integrationId || null
        };

        const jsonData = JSON.stringify(data);
        const url = api.event.edit;
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

    create: async (params: any) => {
        const data = {
            name: params.data.name,
            description: params.data.description || null,
            startDate: params.data.startDate || null,
            integrationId: params.data.integrationId || null
        };

        const jsonData = JSON.stringify(data);
        const url = api.event.create;
        const options = {
            method: 'POST',
            body: jsonData,
            headers: { "Content-Type": "application/json" },
        };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: response };
    },

    delete: async (params: any) => {
        const url = api.event.delete;
        const options = {
            method: 'POST',
            body: JSON.stringify({ id: params.id }),
            headers: { "Content-Type": "application/json" },
        };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: params.previousData };
    },

    getMany: async (_params: any) => {
        throw new Error('GET_MANY not implemented for event');
    },

    getManyReference: async (_params: any) => {
        throw new Error('GET_MANY_REFERENCE not implemented for event');
    },

    updateMany: async (_params: any) => {
        throw new Error('UPDATE_MANY not implemented for event');
    },

    deleteMany: async (_params: any) => {
        throw new Error('DELETE_MANY not implemented for event');
    },
};
