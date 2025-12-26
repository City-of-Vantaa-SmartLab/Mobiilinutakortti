import api from '../api';
import { newHttpErrorFromResponse } from '../utils';
import { httpClientWithRefresh } from '../httpClients';

export const extraEntryProvider = {
    getList: async (params: any) => {
        const field = params.sort.field === "age" ? "birthday" : params.sort.field;
        const controls = {
            filters: {
                name: params.filter.name,
                phoneNumber: params.filter.phoneNumber,
                extraEntryType: params.filter.extraEntryType,
                entryPermitType: params.filter.entryPermitType,
            },
            pagination: {
                page: params.pagination.page,
                perPage: params.pagination.perPage
            },
            sort: {
                field: field,
                order: params.sort.order
            }
        };

        const url = api.extraEntry.list + `?controls=${encodeURIComponent(JSON.stringify(controls))}`;
        const options = { method: 'GET' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return response;
    },

    getOne: async (params: any) => {
        const url = api.extraEntry.base + params.id;
        const options = { method: 'GET' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: response };
    },

    create: async (params: any) => {
        const data = JSON.stringify({
            juniorId: params.data.juniorId,
            entryTypeId: params.data.entryTypeId,
            isPermit: params.data.isPermit
        });

        const url = api.extraEntry.create;
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

    delete: async (params: any) => {
        const urlBase = params.data.isPermit ? api.extraEntry.deletePermit : api.extraEntry.delete;
        const url = `${urlBase}/${params.data.deletableId}`;
        const options = { method: 'DELETE' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: { id: params.id, statusCode: response.statusCode, message: response.message } };
    },

    getMany: async (_params: any) => {
        throw new Error('GET_MANY not implemented for extraEntry');
    },

    getManyReference: async (_params: any) => {
        throw new Error('GET_MANY_REFERENCE not implemented for extraEntry');
    },

    update: async (_params: any) => {
        throw new Error('UPDATE not implemented for extraEntry');
    },

    updateMany: async (_params: any) => {
        throw new Error('UPDATE_MANY not implemented for extraEntry');
    },

    deleteMany: async (_params: any) => {
        throw new Error('DELETE_MANY not implemented for extraEntry');
    },
};
