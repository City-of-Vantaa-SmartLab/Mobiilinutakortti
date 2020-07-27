import {JuniorUserViewModel} from './index';

export class JuniorListViewModel {
    data: JuniorUserViewModel[];
    total: number;

    constructor(data: JuniorUserViewModel[], total: number) {
      this.data = data;
      this.total = total;
    }
  }