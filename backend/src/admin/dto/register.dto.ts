import { IsNotEmpty, IsEmail } from 'class-validator';

/**
 * The dto to be used when registering an admin.
 */
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

    @IsNotEmpty()
    readonly isSuperUser: boolean;

    readonly mainYouthClub: string;
}
