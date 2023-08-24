import { JuniorExtraEntriesViewModel } from "./juniorExtraEntries.vm";

export class ExtraEntryListViewModel {
    data: JuniorExtraEntriesViewModel[];
    total: number;

    constructor(data: JuniorExtraEntriesViewModel[], total: number) {
      this.data = data;
      this.total = total;
    }
  }
