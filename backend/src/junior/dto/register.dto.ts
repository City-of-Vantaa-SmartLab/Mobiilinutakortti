import { IsNotEmpty, Length, IsDateString } from 'class-validator';
import * as content from '../../content';

export class RegisterJuniorDto {

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
    readonly school: string;

    @IsNotEmpty()
    readonly class: string;

    @IsNotEmpty()
    readonly parentsName: string;

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

    @IsNotEmpty()
    readonly communicationsLanguage: string;

    @IsNotEmpty()
    readonly status: string;

    @IsNotEmpty()
    readonly photoPermission: boolean;
}
