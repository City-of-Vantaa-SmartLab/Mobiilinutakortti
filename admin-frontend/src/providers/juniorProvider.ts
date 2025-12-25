import api from '../api';
import { newHttpErrorFromResponse } from '../utils';
import { httpClientWithRefresh } from '../httpClients';

export const juniorProvider = {
    getList: async (params: any) => {
        const controls = {
            filters: {
                name: params.filter.name,
                phoneNumber: params.filter.phoneNumber,
                parentsPhoneNumber: params.filter.parentsPhoneNumber,
                homeYouthClub: params.filter.homeYouthClub,
                status: params.filter.status
            },
            pagination: {
                page: params.pagination.page,
                perPage: params.pagination.perPage
            },
            sort: {
                field: params.sort.field,
                order: params.sort.order
            }
        };

        const url = api.junior.list + `?controls=${encodeURIComponent(JSON.stringify(controls))}`;
        const options = { method: 'GET' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return response;
    },

    getOne: async (params: any) => {
        const url = api.junior.base + params.id;
        const options = { method: 'GET' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: response };
    },

    create: async (params: any) => {
        const data = JSON.stringify({
            phoneNumber: params.data.phoneNumber,
            smsPermissionJunior: params.data.smsPermissionJunior,
            lastName: params.data.lastName,
            firstName: params.data.firstName,
            nickName: params.data.nickName,
            gender: params.data.gender,
            birthday: new Date(params.data.birthday),
            school: params.data.school,
            class: params.data.class,
            homeYouthClub: params.data.homeYouthClub,
            communicationsLanguage: params.data.communicationsLanguage,
            postCode: params.data.postCode,
            parentsName: params.data.parentsName,
            parentsPhoneNumber: params.data.parentsPhoneNumber,
            smsPermissionParent: params.data.smsPermissionParent,
            parentsEmail: params.data.parentsEmail,
            emailPermissionParent: params.data.emailPermissionParent,
            additionalContactInformation: params.data.additionalContactInformation,
            status: params.data.status,
            photoPermission: params.data.photoPermission
        });

        const url = api.junior.create;
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
            phoneNumber: params.data.phoneNumber,
            smsPermissionJunior: params.data.smsPermissionJunior,
            lastName: params.data.lastName,
            firstName: params.data.firstName,
            nickName: params.data.nickName,
            gender: params.data.gender,
            birthday: new Date(params.data.birthday),
            school: params.data.school,
            class: params.data.class,
            homeYouthClub: params.data.homeYouthClub,
            communicationsLanguage: params.data.communicationsLanguage,
            postCode: params.data.postCode,
            parentsName: params.data.parentsName,
            parentsPhoneNumber: params.data.parentsPhoneNumber,
            smsPermissionParent: params.data.smsPermissionParent,
            parentsEmail: params.data.parentsEmail,
            emailPermissionParent: params.data.emailPermissionParent,
            additionalContactInformation: params.data.additionalContactInformation,
            status: params.data.status,
            photoPermission: params.data.photoPermission
        };

        const jsonData = JSON.stringify(data);
        const url = api.junior.edit;
        const options = {
            method: 'POST',
            body: jsonData,
            headers: { "Content-Type": "application/json" },
        };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data }; // React-admin expects this format from UPDATE
    },

    getMany: async (_params: any) => {
        throw new Error('GET_MANY not implemented for junior');
    },

    getManyReference: async (_params: any) => {
        throw new Error('GET_MANY_REFERENCE not implemented for junior');
    },

    updateMany: async (_params: any) => {
        throw new Error('UPDATE_MANY not implemented for junior');
    },

    delete: async (params: any) => {
        const url = api.junior.base + params.id;
        const options = { method: 'DELETE' };

        const response = await httpClientWithRefresh(url, options);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw newHttpErrorFromResponse(response);
        }
        return { data: { id: params.id } };
    },

    deleteMany: async (_params: any) => {
        throw new Error('DELETE_MANY not implemented for junior');
    },
};
