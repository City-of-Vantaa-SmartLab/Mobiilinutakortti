import defaultHttpClient from '../httpClient';
import { juniorProvider } from './juniorProvider';

export const dataProvider = (type, resource, params) => {
  switch (resource) {
    case 'junior': {
      return juniorProvider(type, params, defaultHttpClient);
    }
    default:
      throw new Error(`Unsupported Resource ${resource}`);
  }
};
