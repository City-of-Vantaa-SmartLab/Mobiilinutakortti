import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class RegisterJuniorDto {

    @IsPhoneNumber(null)
    @IsNotEmpty()
    readonly phoneNumber: string;

    @IsNotEmpty()
    readonly firstName: string;

    @IsNotEmpty()
    readonly lastName: string;
}
