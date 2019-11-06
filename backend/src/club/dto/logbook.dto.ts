import { IsNotEmpty, IsDateString } from 'class-validator';
import * as content from '../../content.json';

export class LogBookDto {

    @IsNotEmpty()
    clubId: string;

    @IsNotEmpty()
    @IsDateString({ message: content.NotADate })
    date: string;
}
