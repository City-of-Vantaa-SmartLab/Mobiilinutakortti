import { IsNotEmpty, IsEmail } from 'class-validator';

export class LoginAdminDto {

    @IsNotEmpty()
    readonly email: string;

    @IsEmail()
    @IsNotEmpty()
    readonly password: string;
}
