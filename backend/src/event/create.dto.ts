import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
    @IsNotEmpty()
    name: string;
    description: string | null;
    @Type(() => Date)
    startDate: Date | null;
    @Type(() => Number)
    integrationId: number | null;
    @Type(() => Boolean)
    needsPermit: boolean;
}
