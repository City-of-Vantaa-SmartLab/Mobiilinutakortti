import { IsNotEmpty, Length, IsDateString, ValidateIf } from 'class-validator';
import * as content from '../../content';

export class RegisterJuniorDto {

    @IsNotEmpty()
    readonly phoneNumber: string;

    readonly smsPermissionJunior: boolean;

    @IsNotEmpty()
    readonly firstName: string;

    @IsNotEmpty()
    readonly lastName: string;

    readonly nickName: string;

    @ValidateIf(() => !content.hiddenJuniorFields.includes('postCode'))
    @IsNotEmpty()
    readonly postCode: string;

    @ValidateIf(() => !content.hiddenJuniorFields.includes('school'))
    @IsNotEmpty()
    readonly school: string;

    @ValidateIf(() => !content.hiddenJuniorFields.includes('class'))
    @IsNotEmpty()
    readonly class: string;

    @IsNotEmpty()
    readonly parentsName: string;

    @IsNotEmpty()
    readonly parentsPhoneNumber: string;

    readonly smsPermissionParent: boolean;
    readonly parentsEmail: string;
    readonly emailPermissionParent: boolean;
    readonly additionalContactInformation: string;

    @Length(1, 1)
    @IsNotEmpty()
    readonly gender: string;

    @IsNotEmpty()
    @IsDateString()
    readonly birthday: string;

    readonly homeYouthClub: string;

    @IsNotEmpty()
    readonly communicationsLanguage: string;

    @IsNotEmpty()
    readonly status: string;

    @IsNotEmpty()
    readonly photoPermission: boolean;
}
