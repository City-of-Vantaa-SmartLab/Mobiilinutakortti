import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExtraEntryDto {

    @IsNotEmpty()
    juniorId: string;

    @IsNotEmpty()
    @Type(() => Number)
    entryTypeId: number;

    @Type(() => Boolean)
    isPermit: boolean;
}
