import { IsNotEmpty } from 'class-validator';

export class EditEventDto {
    @IsNotEmpty()
    readonly id: number;
    name: string;
    description: string | null;
    startDate: Date | null;
    integrationId: number | null;
}
