import { IsNotEmpty } from 'class-validator';

export class CheckInDto {
    @IsNotEmpty()
    readonly clubId: string;

    @IsNotEmpty()
    readonly juniorId: string;
}
