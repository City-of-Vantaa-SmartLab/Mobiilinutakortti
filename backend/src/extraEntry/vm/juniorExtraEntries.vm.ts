import { ExtraEntry } from 'src/extraEntry/entities/extraEntry.entity';
import { Junior } from 'src/junior/entities';
import { formatName } from 'src/junior/junior.helper';
import { calculateAge } from 'src/utils/helpers';

export class JuniorExtraEntriesViewModel {
    id: string;
    displayName: string;
    firstName: string;
    lastName: string;
    nickName: string;
    age: number;
    phoneNumber: string;
    extraEntries: ExtraEntry[];

    constructor(entity: Junior) {
        this.id = entity.id;
        this.displayName = formatName(entity.firstName, entity.lastName, entity.nickName);
        this.age = calculateAge(entity.birthday);
        this.phoneNumber = entity.phoneNumber;
        this.extraEntries = entity.extraEntries;
    }
}
