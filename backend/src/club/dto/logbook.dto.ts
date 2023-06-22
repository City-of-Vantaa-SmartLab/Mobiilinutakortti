import { IsNotEmpty, IsDateString } from 'class-validator';

export class LogBookDto {

    @IsNotEmpty()
    clubId: string;

    @IsNotEmpty()
    @IsDateString()
    date: string;
}
