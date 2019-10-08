import { IsNotEmpty, IsEmail } from 'class-validator';

export class LoginAdminDto {

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    readonly password: string;
}
