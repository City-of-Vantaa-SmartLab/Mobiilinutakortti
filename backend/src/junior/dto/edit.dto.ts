import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class EditJuniorDto {

    @IsNotEmpty()
    readonly id: string;

    @IsPhoneNumber('FI')
    phoneNumber: string;

    firstName: string;

    lastName: string;
}
