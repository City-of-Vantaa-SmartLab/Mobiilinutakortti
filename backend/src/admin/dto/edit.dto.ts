import { IsNotEmpty, IsEmail, IsLowercase } from 'class-validator';

export class EditAdminDto {

    @IsNotEmpty()
    readonly id: string;

    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsNotEmpty()
    readonly firstName: string;

    @IsNotEmpty()
    readonly lastName: string;

    @IsNotEmpty()
    readonly isSuperUser: boolean;
}
