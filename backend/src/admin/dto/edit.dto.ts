import { IsNotEmpty, IsEmail, IsLowercase } from 'class-validator';

export class EditAdminDto {

    @IsNotEmpty()
    readonly id: string;

    @IsEmail()
    email: string;

    firstName: string;

    lastName: string;

    isSuperUser: boolean;
}
