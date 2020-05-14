import { IsNotEmpty } from 'class-validator';

export class AcsDto {
  @IsNotEmpty()
  readonly sessionIndex: string;

  @IsNotEmpty()
  readonly nameId: string;

  // Note: there might be several names separated by a space.
  @IsNotEmpty()
  readonly firstName: string;

  @IsNotEmpty()
  readonly lastName: string;

  @IsNotEmpty()
  readonly zipCode: string;
}
