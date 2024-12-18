import { IsNotEmpty } from 'class-validator';
import { Messages } from '../classes/messages';
import { KompassiIntegration } from '../entities';

export class EditClubDto {
    @IsNotEmpty()
    readonly id: number;
    readonly name: string;
    postCode: string;
    active: boolean;
    messages: Messages;
    kompassiIntegration: KompassiIntegration;
}
