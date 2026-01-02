import type { DataProvider } from 'react-admin';
import { announcementProvider } from './announcementProvider';
import { extraEntryProvider } from './extraEntryProvider';
import { extraEntryTypeProvider } from './extraEntryTypeProvider';
import { juniorProvider } from './juniorProvider';
import { youthClubProvider } from './youthClubProvider';
import { youthWorkerProvider } from './youthWorkerProvider';
import { eventProvider } from './eventProvider';

const resourceProviders: Record<string, any> = {
  junior: juniorProvider,
  youthWorker: youthWorkerProvider,
  youthClub: youthClubProvider,
  editYouthClub: youthClubProvider,
  announcement: announcementProvider,
  extraEntry: extraEntryProvider,
  extraEntryType: extraEntryTypeProvider,
  event: eventProvider
};

export const dataProvider: DataProvider = {
  getList: (resource: string, params: any) => {
    const provider = resourceProviders[resource];
    if (!provider) {
      return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
    return provider.getList(params);
  },

  getOne: (resource: string, params: any) => {
    const provider = resourceProviders[resource];
    if (!provider) {
      return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
    return provider.getOne(params);
  },

  getMany: (resource: string, params: any) => {
    const provider = resourceProviders[resource];
    if (!provider) {
      return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
    return provider.getMany(params);
  },

  getManyReference: (resource: string, params: any) => {
    const provider = resourceProviders[resource];
    if (!provider) {
      return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
    return provider.getManyReference(params);
  },

  create: (resource: string, params: any) => {
    const provider = resourceProviders[resource];
    if (!provider) {
      return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
    return provider.create(params);
  },

  update: (resource: string, params: any) => {
    const provider = resourceProviders[resource];
    if (!provider) {
      return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
    return provider.update(params);
  },

  updateMany: (resource: string, params: any) => {
    const provider = resourceProviders[resource];
    if (!provider) {
      return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
    return provider.updateMany(params);
  },

  delete: (resource: string, params: any) => {
    const provider = resourceProviders[resource];
    if (!provider) {
      return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
    return provider.delete(params);
  },

  deleteMany: (resource: string, params: any) => {
    const provider = resourceProviders[resource];
    if (!provider) {
      return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
    return provider.deleteMany(params);
  },
};
