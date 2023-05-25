import { IsNotEmpty, IsEmail } from 'class-validator';

/**
 * The dto to be used when registering a youth worker.
 */
export class RegisterYouthWorkerDto {

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
    readonly isAdmin: boolean;

    readonly mainYouthClub: string;
}
