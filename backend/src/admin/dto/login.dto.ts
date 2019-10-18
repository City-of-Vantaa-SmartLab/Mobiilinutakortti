import { IsNotEmpty, IsEmail } from 'class-validator';

/**
 * The dto to be used when logging in an admin.
 */
export class LoginAdminDto {

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    readonly password: string;
}
