import { IsNotEmpty, IsPhoneNumber, Length, IsDateString } from 'class-validator';
import * as content from '../../content.json';

export class RegisterJuniorDto {

    @IsPhoneNumber('FI', { message: content.ValueIsNotPhoneNumber })
    @IsNotEmpty()
    readonly phoneNumber: string;

    @IsNotEmpty()
    readonly firstName: string;

    @IsNotEmpty()
    readonly lastName: string;

    readonly nickName: string;

    @IsNotEmpty()
    readonly postCode: string;

    @IsNotEmpty()
    readonly parentsName: string;

    @IsPhoneNumber('FI', { message: content.ValueIsNotPhoneNumber })
    @IsNotEmpty()
    readonly parentsPhoneNumber: string;

    @Length(1, 1)
    @IsNotEmpty()
    readonly gender: string;

    @IsNotEmpty()
    @IsDateString({ message: content.NotADate })
    readonly birthday: string;

    @IsNotEmpty()
    readonly homeYouthClub: string;
}
