import { IsNotEmpty } from 'class-validator';

export class LogBookDto {

    @IsNotEmpty()
    clubId: string;

    @IsNotEmpty()
    dateTimeStamp: string;
}
