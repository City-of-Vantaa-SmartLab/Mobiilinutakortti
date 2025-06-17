import { IsNotEmpty } from 'class-validator';

export class CreateEntryTypeDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    expiryAge: number;
}
