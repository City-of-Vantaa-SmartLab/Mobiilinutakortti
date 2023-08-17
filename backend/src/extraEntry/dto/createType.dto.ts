import { IsNotEmpty } from 'class-validator';

export class CreateExtraEntryTypeDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    expiryAge: number;
}
