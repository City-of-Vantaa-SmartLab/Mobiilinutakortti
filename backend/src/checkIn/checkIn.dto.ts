import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckInDto {
    @IsNotEmpty()
    @Type(() => Number)
    readonly targetId: number;

    @IsNotEmpty()
    readonly juniorId: string;

    readonly securityCode: string;
}
