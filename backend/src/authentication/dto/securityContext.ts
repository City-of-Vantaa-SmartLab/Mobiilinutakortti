import { IsNotEmpty } from 'class-validator';

export class SecurityContextDto {
  @IsNotEmpty()
  readonly sessionIndex: string;

  @IsNotEmpty()
  readonly nameId: string;

  @IsNotEmpty()
  readonly signedString: string;

  // Note: there might be several names separated by a space.
  @IsNotEmpty()
  readonly firstName: string;

  @IsNotEmpty()
  readonly lastName: string;

  @IsNotEmpty()
  readonly zipCode: string;

  @IsNotEmpty()
  readonly expiryTime: string;
}
