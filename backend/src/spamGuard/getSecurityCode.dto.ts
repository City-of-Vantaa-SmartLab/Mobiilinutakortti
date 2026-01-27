import { IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSecurityCodeDto {
    @IsNotEmpty()
    @Type(() => Number)
    readonly targetId: number;

    @IsOptional()
    @IsBoolean()
    readonly forEvent?: boolean;
}
