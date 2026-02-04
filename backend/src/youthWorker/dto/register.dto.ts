import { IsNotEmpty, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

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
    @Type(() => Boolean)
    readonly isAdmin: boolean;

    @Type(() => Number)
    readonly mainYouthClub: number;
}
