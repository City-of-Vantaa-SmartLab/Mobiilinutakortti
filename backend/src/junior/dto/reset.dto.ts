import { IsNotEmpty } from 'class-validator';
import * as content from '../../content.json';

export class ResetJuniorDto {

    @IsNotEmpty()
    readonly phoneNumber: string;

}
