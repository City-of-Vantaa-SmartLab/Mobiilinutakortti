import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { Messages } from '../classes/messages';
import { KompassiIntegration } from '../../kompassi/kompassiIntegration.entity';

export class EditClubDto {
    @IsNotEmpty()
    @Type(() => Number)
    readonly id: number;
    readonly name: string;
    postCode: string;
    @Type(() => Boolean)
    active: boolean;
    messages: Messages;
    kompassiIntegration: KompassiIntegration;
}
