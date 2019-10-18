import { IsNotEmpty, IsPhoneNumber, Length, IsPositive } from 'class-validator';

export class EditJuniorDto {

    @IsNotEmpty()
    readonly id: string;

    @IsPhoneNumber('FI')
    phoneNumber: string;

    firstName: string;

    lastName: string;

    postCode: string;

    parentsName: string;

    @IsPhoneNumber('FI')
    parentsPhoneNumber: string;

    @Length(1, 1)
    gender: string;

    age: number;

    homeYouthClub: string;
}
