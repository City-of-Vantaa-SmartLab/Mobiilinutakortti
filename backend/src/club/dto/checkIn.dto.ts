import { IsNotEmpty } from 'class-validator';

export class CheckInDto {
    @IsNotEmpty()
    readonly clubId: number;

    @IsNotEmpty()
    readonly juniorId: string;
}
