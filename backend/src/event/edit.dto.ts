import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class EditEventDto {
    @IsNotEmpty()
    @Type(() => Number)
    readonly id: number;
    name: string;
    description: string | null;
    @Type(() => Date)
    startDate: Date | null;
    @Type(() => Number)
    integrationId: number | null;
    @Type(() => Boolean)
    needsPermit: boolean;
}
