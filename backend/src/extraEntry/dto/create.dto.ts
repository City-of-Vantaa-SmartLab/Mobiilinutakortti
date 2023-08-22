import { IsNotEmpty } from 'class-validator';

export class CreateExtraEntryDto {

    @IsNotEmpty()
    juniorId: string;

    @IsNotEmpty()
    extraEntryTypeId: number;
}
