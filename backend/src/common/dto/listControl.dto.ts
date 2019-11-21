import { FilterDto } from './filter.dto';
import { PaginationDto } from './pagination.dto';
import { SortDto } from './sort.dto';

export class ListControlDto {
    filters: FilterDto;
    pagination: PaginationDto;
    sort: SortDto;
}
