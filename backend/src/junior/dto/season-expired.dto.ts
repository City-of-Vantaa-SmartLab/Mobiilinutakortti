import { IsNotEmpty } from 'class-validator';

export class SeasonExpiredDto {

    @IsNotEmpty()
    readonly expireDate: string;

}
