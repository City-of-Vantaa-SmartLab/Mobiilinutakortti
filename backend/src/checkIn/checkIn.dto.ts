import { IsNotEmpty } from 'class-validator';

export class CheckInDto {
    @IsNotEmpty()
    readonly targetId: number;

    @IsNotEmpty()
    readonly juniorId: string;

    readonly securityCode: string;
}
