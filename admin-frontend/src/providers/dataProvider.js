import defaultHttpClient from '../httpClient';
import { juniorProvider } from './juniorProvider';
import { youthClubProvider } from './youthClubProvider';
import { youthWorkerProvider } from './youthWorkerProvider';

export const dataProvider = (type, resource, params) => {
  switch (resource) {
    case 'junior': {
      return juniorProvider(type, params, defaultHttpClient);
    }
    case 'youthClub': {
      return youthClubProvider(type, params, defaultHttpClient);
    }
    case 'youthWorker': {
      return youthWorkerProvider(type, params, defaultHttpClient);
    }
    default:
      throw new Error(`Unsupported Resource ${resource}`);
  }
};
