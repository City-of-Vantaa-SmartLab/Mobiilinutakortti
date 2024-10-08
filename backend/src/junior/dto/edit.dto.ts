import { IsNotEmpty, Length, IsDateString } from 'class-validator';

export class EditJuniorDto {

    @IsNotEmpty()
    readonly id: string;

    phoneNumber: string;
    smsPermissionJunior: boolean;
    firstName: string;
    lastName: string;
    nickName: string;
    postCode: string;
    school: string;
    class: string;
    parentsName: string;
    parentsPhoneNumber: string;
    smsPermissionParent: boolean;
    parentsEmail: string;
    emailPermissionParent: boolean;
    additionalContactInformation: string;

    @Length(1, 1)
    gender: string;

    @IsDateString()
    birthday: string;

    homeYouthClub: number;
    communicationsLanguage: string;
    status: string;
    photoPermission: boolean;
}
