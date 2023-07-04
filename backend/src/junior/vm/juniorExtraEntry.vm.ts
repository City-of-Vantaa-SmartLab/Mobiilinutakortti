import { Junior } from '../entities';
import { ExtraEntry } from 'src/extraEntry/entities/extraEntry.entity';
import { formatName } from '../junior.helper';

export class JuniorExtraEntryViewModel {
    id: string;
    displayName: string;
    firstName: string;
    lastName: string;
    nickName: string;
    birthday: string;
    phoneNumber: string;
    extraEntries: ExtraEntry[];

    constructor(entity: Junior) {
        this.id = entity.id;
        this.displayName = formatName(entity.firstName, entity.lastName, entity.nickName);
        this.birthday = entity.birthday;
        this.phoneNumber = entity.phoneNumber;
        this.extraEntries = entity.extraEntries;
    }
}
