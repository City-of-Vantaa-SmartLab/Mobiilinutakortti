import { IsNotEmpty, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

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
    @Type(() => Boolean)
    isAdmin: boolean;
    @Type(() => Number)
    mainYouthClub: number;
}
