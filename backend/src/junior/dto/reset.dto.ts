import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class ResetJuniorDto {

    @IsPhoneNumber('FI')
    @IsNotEmpty()
    readonly phoneNumber: string;

}
