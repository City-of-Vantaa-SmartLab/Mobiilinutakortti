import { httpClientWithResponse } from '../httpClients';
import { juniorProvider } from './juniorProvider';
import { youthClubProvider } from './youthClubProvider';
import { youthWorkerProvider } from './youthWorkerProvider';

export const dataProvider = (type, resource, params) => {
  switch (resource) {
    case 'junior': {
      return juniorProvider(type, params, httpClientWithResponse);
    }
    case 'youthClub': {
      return youthClubProvider(type, params, httpClientWithResponse);
    }
    case 'youthWorker': {
      return youthWorkerProvider(type, params, httpClientWithResponse);
    }
    default:
      throw new Error(`Unsupported Resource ${resource}`);
  }
};
