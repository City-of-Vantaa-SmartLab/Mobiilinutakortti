import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class EditJuniorDto {

    @IsNotEmpty()
    readonly id: string;

    @IsPhoneNumber('FI')
    @IsNotEmpty()
    readonly phoneNumber: string;

    @IsNotEmpty()
    readonly firstName: string;

    @IsNotEmpty()
    readonly lastName: string;
}
