import { IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';

export class RegisterJuniorDto {

    @IsPhoneNumber('FI')
    @IsNotEmpty()
    readonly phoneNumber: string;

    @IsNotEmpty()
    readonly firstName: string;

    @IsNotEmpty()
    readonly lastName: string;

    @IsNotEmpty()
    readonly postCode: string;

    @IsNotEmpty()
    readonly parentsName: string;

    @IsPhoneNumber('FI')
    @IsNotEmpty()
    readonly parentsPhoneNumber: string;

    @Length(1, 1)
    @IsNotEmpty()
    readonly gender: string;

    @IsNotEmpty()
    readonly age: number;

    @IsNotEmpty()
    readonly homeYouthClub: string;
}
