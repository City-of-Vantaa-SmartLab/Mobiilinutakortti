import { ExtraEntry } from 'src/extraEntry/entities/extraEntry.entity';
import { Junior } from 'src/junior/entities';
import { formatName } from 'src/junior/junior.helper';
import { calculateAge } from 'src/utils/helpers';
import { Permit } from '../entities/permit.entity';

export class JuniorExtraEntriesViewModel {
    age: number;
    birthday: string;
    id: string;
    displayName: string;
    extraEntries: ExtraEntry[];
    permits: Permit[];
    phoneNumber: string;
    status: string;

    constructor(entity: Junior) {
        this.age = calculateAge(entity.birthday);
        this.birthday = entity.birthday;
        this.displayName = formatName(entity.firstName, entity.lastName, entity.nickName);
        this.extraEntries = entity.extraEntries;
        this.permits = entity.permits;
        this.id = entity.id;
        this.phoneNumber = entity.phoneNumber;
        this.status = entity.status;
    }
}
