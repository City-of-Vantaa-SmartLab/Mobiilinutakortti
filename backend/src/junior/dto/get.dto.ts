import { IsNotEmpty } from 'class-validator';

export class GetJuniorDto {

    @IsNotEmpty()
    readonly id: string;

}
