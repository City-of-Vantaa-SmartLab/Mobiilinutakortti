import { IsNotEmpty, IsDateString } from 'class-validator';

export class CheckInStatsSettingsDto {

    @IsNotEmpty()
    targetId: number;

    @IsNotEmpty()
    @IsDateString()
    date: string;
}
