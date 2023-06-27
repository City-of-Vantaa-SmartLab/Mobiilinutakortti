import { ExtraEntryType } from '../entities/extraEntryType';

export class ExtraEntryTypeViewModel {
    id: number;
    title: string;
    expiryAge: number;

    constructor(extraEntryType: ExtraEntryType) {
        this.id = extraEntryType.id;
        this.title = extraEntryType.title;
        this.expiryAge = extraEntryType.expiryAge;
    }
}
