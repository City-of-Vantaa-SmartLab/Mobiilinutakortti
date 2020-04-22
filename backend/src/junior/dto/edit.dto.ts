import { IsNotEmpty, IsPhoneNumber, Length, IsDateString, IsDate } from 'class-validator';
import * as content from '../../content.json';

export class EditJuniorDto {

    @IsNotEmpty()
    readonly id: string;

    @IsPhoneNumber('FI', { message: content.ValueIsNotPhoneNumber })
    phoneNumber: string;

    firstName: string;

    lastName: string;

    nickName: string;

    postCode: string;

    school: string;

    class: string;

    parentsName: string;

    @IsPhoneNumber('FI', { message: content.ValueIsNotPhoneNumber })
    parentsPhoneNumber: string;

    @Length(1, 1)
    gender: string;

    @IsDateString({ message: content.NotADate })
    birthday: string;

    homeYouthClub: string;

    status: string;

    photoPermission: boolean;
}
