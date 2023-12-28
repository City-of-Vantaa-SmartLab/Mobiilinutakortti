import { IsNotEmpty, IsEmail } from 'class-validator';

/**
 * The dto to be used when logging in a youth worker.
 */
export class LoginYouthWorkerDto {

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    readonly password: string;
}

export class LoginYouthWorkerEntraDto {

    @IsNotEmpty()
    readonly msalToken: string;
}
