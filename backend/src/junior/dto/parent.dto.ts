import { RegisterJuniorDto } from './';
import { SecurityContextDto } from '../../authentication/dto/';

export class ParentFormDto {

  readonly userData: RegisterJuniorDto;

  readonly securityContext: SecurityContextDto;
}
