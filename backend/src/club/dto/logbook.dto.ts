import { IsNotEmpty, IsDateString } from 'class-validator';
import * as content from '../../content';

export class LogBookDto {

    @IsNotEmpty()
    clubId: string;

    @IsNotEmpty()
    @IsDateString({ message: content.NotADate })
    date: string;
}
