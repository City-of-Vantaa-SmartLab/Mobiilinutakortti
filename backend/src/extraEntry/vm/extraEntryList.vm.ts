import { ExtraEntryViewModel } from "./extraEntry.vm";

export class ExtraEntryListViewModel {
    data: ExtraEntryViewModel[];
    total: number;

    constructor(data: ExtraEntryViewModel[], total: number) {
      this.data = data;
      this.total = total;
    }
  }