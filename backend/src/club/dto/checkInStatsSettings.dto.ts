import { IsNotEmpty, IsDateString } from 'class-validator';

export class CheckInStatsSettingsDto {

    @IsNotEmpty()
    clubId: number;

    @IsNotEmpty()
    @IsDateString()
    date: string;
}
