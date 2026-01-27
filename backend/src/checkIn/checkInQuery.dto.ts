import { IsNotEmpty, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckInQueryDto {

    @IsNotEmpty()
    @Type(() => Number)
    targetId: number;

    @IsNotEmpty()
    @IsDateString()
    date: string;
}
