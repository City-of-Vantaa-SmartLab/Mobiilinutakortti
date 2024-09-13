import { IsNotEmpty } from 'class-validator';

export class ResetJuniorDto {

    @IsNotEmpty()
    readonly phoneNumber: string;

}
