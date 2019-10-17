import { IsNotEmpty, IsEmail } from 'class-validator';

/**
 * The dto to be used when editing an admin.
 */
export class EditAdminDto {

    @IsNotEmpty()
    readonly id: string;

    @IsEmail()
    email: string;

    firstName: string;

    lastName: string;

    isSuperUser: boolean;
}
