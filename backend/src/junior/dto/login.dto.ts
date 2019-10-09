import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class LoginJuniorDto {

    @IsPhoneNumber('FI')
    @IsNotEmpty()
    readonly phoneNumber: string;

    @IsNotEmpty()
    readonly pin: string;
}
