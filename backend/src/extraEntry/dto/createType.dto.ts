import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEntryTypeDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @Type(() => Number)
    expiryAge: number;
}
