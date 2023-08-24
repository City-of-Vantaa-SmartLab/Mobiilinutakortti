import { IsNotEmpty, IsDateString } from 'class-validator';

export class LogBookDto {

    @IsNotEmpty()
    clubId: number;

    @IsNotEmpty()
    @IsDateString()
    date: string;
}
