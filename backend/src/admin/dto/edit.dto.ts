import { IsNotEmpty, IsEmail } from 'class-validator';

export class EditAdminDto {

    @IsNotEmpty()
    readonly id: string;

    @IsEmail()
    email: string;

    firstName: string;

    lastName: string;

    isSuperUser: boolean;
}
