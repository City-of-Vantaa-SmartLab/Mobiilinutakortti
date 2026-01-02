import { IsNotEmpty } from 'class-validator';

export class CreateEventDto {
    @IsNotEmpty()
    name: string;
    description: string | null;
    startDate: Date | null;
    integrationId: number | null;
}
