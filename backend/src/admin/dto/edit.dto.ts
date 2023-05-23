import { IsNotEmpty, IsEmail } from 'class-validator';

/**
 * The dto to be used when editing a youth worker.
 */
export class EditYouthWorkerDto {

    @IsNotEmpty()
    readonly id: string;

    @IsEmail()
    email: string;

    firstName: string;

    lastName: string;

    isAdmin: boolean;

    mainYouthClub: string;
}
