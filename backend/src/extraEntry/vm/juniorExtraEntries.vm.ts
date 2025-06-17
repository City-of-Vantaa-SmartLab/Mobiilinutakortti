import { calculateAge, formatName } from '../../common/helpers';
import { ExtraEntry, EntryPermit } from '../entities';
import { Junior } from '../../junior/entities';

export class JuniorExtraEntriesViewModel {
    age: number;
    birthday: string;
    id: string;
    displayName: string;
    extraEntries: ExtraEntry[];
    entryPermits: EntryPermit[];
    phoneNumber: string;
    status: string;

    constructor(entity: Junior) {
        this.age = calculateAge(entity.birthday);
        this.birthday = entity.birthday;
        this.displayName = formatName(entity.firstName, entity.lastName, entity.nickName);
        this.extraEntries = entity.extraEntries;
        this.entryPermits = entity.entryPermits;
        this.id = entity.id;
        this.phoneNumber = entity.phoneNumber;
        this.status = entity.status;
    }
}
