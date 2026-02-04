import { Type } from 'class-transformer';

export class PaginationDto {
    @Type(() => Number)
    page: number;
    @Type(() => Number)
    perPage: number;
}
