import { IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';
import * as content from '../../content.json';

export class EditJuniorDto {

    @IsNotEmpty()
    readonly id: string;

    @IsPhoneNumber('FI', { message: content.ValueIsNotPhoneNumber })
    phoneNumber: string;

    firstName: string;

    lastName: string;

    postCode: string;

    parentsName: string;

    @IsPhoneNumber('FI', { message: content.ValueIsNotPhoneNumber })
    parentsPhoneNumber: string;

    @Length(1, 1)
    gender: string;

    age: number;

    homeYouthClub: string;
}
