import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class LoginJuniorDto {

    @IsPhoneNumber(null)
    @IsNotEmpty()
    readonly phoneNumber: string;

    @IsNotEmpty()
    readonly pin: string;
}
