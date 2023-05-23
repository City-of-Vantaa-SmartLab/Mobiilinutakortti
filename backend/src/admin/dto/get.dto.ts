import { IsNotEmpty } from 'class-validator';

export class GetYouthWorkerDto {

    @IsNotEmpty()
    readonly id: string;

}
