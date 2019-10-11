import { IsNotEmpty, IsEmail, IsLowercase } from 'class-validator';

export class RegisterAdminDto {

    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsNotEmpty()
    readonly password: string;

    @IsNotEmpty()
    readonly firstName: string;

    @IsNotEmpty()
    readonly lastName: string;

    readonly isSuperUser: boolean = false;
}
