import { IsNotEmpty } from 'class-validator';
import { KompassiIntegration } from '../kompassi/kompassiIntegration.entity';

export class EditEventDto {
    @IsNotEmpty()
    readonly id: number;
    name: string;
    description: string | null;
    startDate: Date | null;
    kompassiIntegration: KompassiIntegration;
}
