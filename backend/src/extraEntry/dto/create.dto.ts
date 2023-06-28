import { IsNotEmpty } from 'class-validator';

export class CreateExtraEntryTypeDto {

    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    expiryAge: number;
}
