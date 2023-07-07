import { ExtraEntryType } from '../entities';

export class ExtraEntryTypeViewModel {
    id: number;
    name: string;
    expiryAge: number;

    constructor(extraEntryType: ExtraEntryType) {
        this.id = extraEntryType.id;
        this.name = extraEntryType.name;
        this.expiryAge = extraEntryType.expiryAge;
    }
}
