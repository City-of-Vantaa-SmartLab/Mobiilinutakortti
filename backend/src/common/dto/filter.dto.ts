import { Type } from 'class-transformer';

export class FilterDto {
    name: string;
    homeYouthClub: string;
    status: string;
    phoneNumber: string;
    parentsPhoneNumber: string;
    @Type(() => Number)
    extraEntryType: number;
    @Type(() => Number)
    entryPermitType: number;
}
