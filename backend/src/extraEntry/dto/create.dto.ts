import { IsNotEmpty } from 'class-validator';

export class CreateExtraEntryDto {

    @IsNotEmpty()
    juniorId: string;

    @IsNotEmpty()
    entryTypeId: number;

    isPermit: boolean;
}
