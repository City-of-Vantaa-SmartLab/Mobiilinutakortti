import { IsNotEmpty, IsDateString } from 'class-validator';

export class CheckInQueryDto {

    @IsNotEmpty()
    targetId: number;

    @IsNotEmpty()
    @IsDateString()
    date: string;
}
