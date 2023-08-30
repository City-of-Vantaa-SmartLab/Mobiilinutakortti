import { httpClientWithRefresh } from '../httpClients';
import {
  announcementProvider,
  extraEntryProvider,
  extraEntryTypeProvider,
  juniorProvider,
  youthClubProvider,
  youthWorkerProvider
} from './';

export const dataProvider = (type, resource, params) => {
  switch (resource) {
    case 'announcement': {
      return announcementProvider(type, params, httpClientWithRefresh);
    }
    case 'editYouthClubs': {
      return youthClubProvider(type, params, httpClientWithRefresh);
    }
    case 'extraEntry': {
      return extraEntryProvider(type, params, httpClientWithRefresh);
    }
    case 'extraEntryType': {
      return extraEntryTypeProvider(type, params, httpClientWithRefresh);
    }
    case 'junior': {
      return juniorProvider(type, params, httpClientWithRefresh);
    }
    case 'youthClub': {
      return youthClubProvider(type, params, httpClientWithRefresh);
    }
    case 'youthWorker': {
      return youthWorkerProvider(type, params, httpClientWithRefresh);
    }
    default:
      throw new Error(`Unsupported Resource ${resource}`);
  }
};
