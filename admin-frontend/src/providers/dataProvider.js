import { httpClientWithRefresh } from '../httpClients';
import { juniorProvider } from './juniorProvider';
import { youthClubProvider } from './youthClubProvider';
import { youthWorkerProvider } from './youthWorkerProvider';
import { announcementProvider } from './announcementProvider';
import { extraEntryTypeProvider } from './extraEntryTypeProvider';

export const dataProvider = (type, resource, params) => {
  switch (resource) {
    case 'junior': {
      return juniorProvider(type, params, httpClientWithRefresh);
    }
    case 'youthClub': {
      return youthClubProvider(type, params, httpClientWithRefresh);
    }
    case 'editYouthClubs': {
      return youthClubProvider(type, params, httpClientWithRefresh);
    }
    case 'youthWorker': {
      return youthWorkerProvider(type, params, httpClientWithRefresh);
    }
    case 'announcement': {
      return announcementProvider(type, params, httpClientWithRefresh);
    }
    case 'extraEntryType': {
      return extraEntryTypeProvider(type, params, httpClientWithRefresh);
    }
    default:
      throw new Error(`Unsupported Resource ${resource}`);
  }
};
