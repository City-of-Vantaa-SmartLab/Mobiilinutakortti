import { IsNotEmpty, Length, IsDateString, IsDate } from 'class-validator';
import * as content from '../../content';

export class EditJuniorDto {

    @IsNotEmpty()
    readonly id: string;

    phoneNumber: string;

    firstName: string;

    lastName: string;

    nickName: string;

    postCode: string;

    school: string;

    class: string;

    parentsName: string;

    parentsPhoneNumber: string;

    @Length(1, 1)
    gender: string;

    @IsDateString({ message: content.NotADate })
    birthday: string;

    homeYouthClub: string;

    status: string;

    photoPermission: boolean;
}
