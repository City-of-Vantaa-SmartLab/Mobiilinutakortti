import { IsNotEmpty } from 'class-validator';

export class GetAdminDto {

    @IsNotEmpty()
    readonly id: string;

}
