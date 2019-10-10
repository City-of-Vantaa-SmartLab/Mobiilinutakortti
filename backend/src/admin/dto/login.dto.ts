import { IsNotEmpty, IsEmail, IsLowercase } from 'class-validator';

export class LoginAdminDto {

    @IsNotEmpty()
    @IsEmail()
    @IsLowercase()
    readonly email: string;

    @IsNotEmpty()
    readonly password: string;
}
