import { IsDateString, IsNotEmpty } from 'class-validator';

export class SeasonExpiredDto {

    @IsNotEmpty()
    @IsDateString()
    readonly expireDate: string;

}
