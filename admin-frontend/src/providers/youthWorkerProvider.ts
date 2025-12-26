import api from '../api';
import { newHttpErrorFromResponse } from '../utils';
import { httpClientWithRefresh } from '../httpClients';

export const youthWorkerProvider = {
    getList: async (_params: any) => {
        const url = api.youthWorker.list;
        const options = { method: 'GET' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: response, total: response.length };
    },

    getOne: async (params: any) => {
        const url = api.youthWorker.base + params.id;
        const options = { method: 'GET' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: response };
    },

    create: async (params: any) => {
        const data = JSON.stringify({
            email: params.data.email,
            password: params.data.password,
            firstName: params.data.firstName,
            lastName: params.data.lastName,
            isAdmin: params.data.isAdmin,
            mainYouthClub: params.data.mainYouthClub,
        });

        const url = api.youthWorker.create;
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

    update: async (params: any) => {
        const data = {
            id: params.data.id,
            email: params.data.email,
            firstName: params.data.firstName,
            lastName: params.data.lastName,
            isAdmin: params.data.isAdmin,
            mainYouthClub: params.data.mainYouthClub
        };

        const jsonData = JSON.stringify(data);
        const url = api.youthWorker.edit;
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

    delete: async (params: any) => {
        const url = api.youthWorker.base + params.id;
        const options = { method: 'DELETE' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: { id: params.id } };
    },

    getMany: async (_params: any) => {
        throw new Error('GET_MANY not implemented for youthWorker');
    },

    getManyReference: async (_params: any) => {
        throw new Error('GET_MANY_REFERENCE not implemented for youthWorker');
    },

    updateMany: async (_params: any) => {
        throw new Error('UPDATE_MANY not implemented for youthWorker');
    },

    deleteMany: async (_params: any) => {
        throw new Error('DELETE_MANY not implemented for youthWorker');
    },
};
