import { IsNotEmpty } from 'class-validator';
import { Messages } from '../classes/messages';

export class EditClubDto {

    @IsNotEmpty()
    readonly id: number;

    readonly name: string;

    postCode: string;

    active: boolean;

    messages: Messages
}
