import { IsNotEmpty } from 'class-validator';

export class SessionDataDto {
  @IsNotEmpty()
  readonly sessionIndex: string;

  @IsNotEmpty()
  readonly signedString: string;

  @IsNotEmpty()
  readonly firstName: string;

  @IsNotEmpty()
  readonly lastName: string;

  @IsNotEmpty()
  readonly zipCode: string;

  @IsNotEmpty()
  readonly expireTime: string;
}
