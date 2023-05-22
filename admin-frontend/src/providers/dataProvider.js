import { httpClientWithRefresh } from '../httpClients';
import { juniorProvider } from './juniorProvider';
import { youthClubProvider } from './youthClubProvider';
import { youthWorkerProvider } from './youthWorkerProvider';

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
    default:
      throw new Error(`Unsupported Resource ${resource}`);
  }
};
