import { IsNotEmpty, Length, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class EditJuniorDto {

    @IsNotEmpty()
    readonly id: string;

    phoneNumber: string;
    @Type(() => Boolean)
    smsPermissionJunior: boolean;
    firstName: string;
    lastName: string;
    nickName: string;
    postCode: string;
    school: string;
    class: string;
    parentsName: string;
    parentsPhoneNumber: string;
    @Type(() => Boolean)
    smsPermissionParent: boolean;
    parentsEmail: string;
    @Type(() => Boolean)
    emailPermissionParent: boolean;
    additionalContactInformation: string;

    @Length(1, 1)
    gender: string;

    @IsDateString()
    birthday: string;

    @Type(() => Number)
    homeYouthClub: number;
    communicationsLanguage: string;
    status: string;
    @Type(() => Boolean)
    photoPermission: boolean;
}
