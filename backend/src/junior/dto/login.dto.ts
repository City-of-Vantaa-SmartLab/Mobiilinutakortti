import { IsNotEmpty } from 'class-validator';

export class LoginJuniorDto {

    @IsNotEmpty()
    readonly id: string;

    @IsNotEmpty()
    readonly challenge: string;
}
