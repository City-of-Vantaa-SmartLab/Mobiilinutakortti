import { IsNotEmpty, IsPhoneNumber } from 'class-validator';
import * as content from '../../content.json';

export class ResetJuniorDto {

    @IsPhoneNumber('FI', { message: content.PhoneNumbersMustBeFinnish })
    @IsNotEmpty()
    readonly phoneNumber: string;

}
