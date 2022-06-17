import { IsNotEmpty } from 'class-validator';
import * as content from '../../content';

export class ResetJuniorDto {

    @IsNotEmpty()
    readonly phoneNumber: string;

}
