import { EntryType } from '../entities';

export class EntryTypeViewModel {
    id: number;
    name: string;
    expiryAge: number;

    constructor(entryType: EntryType) {
        this.id = entryType.id;
        this.name = entryType.name;
        this.expiryAge = entryType.expiryAge;
    }
}
