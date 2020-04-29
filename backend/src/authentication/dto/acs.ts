import { IsNotEmpty } from 'class-validator';

export class AcsDto {
  @IsNotEmpty()
  readonly sessionIndex: string;

  @IsNotEmpty()
  readonly firstName: string;

  @IsNotEmpty()
  readonly lastName: string;

  @IsNotEmpty()
  readonly zipCode: string;
}
