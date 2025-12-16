import { PipeTransform, BadRequestException } from "@nestjs/common";
import { allowedPhoneNumber } from "./constants";
import * as content from '../../content';

// Custom pipe for handling "phoneNumber" validation while resending SMS
export class ResetPhoneNumberValidationPipe implements PipeTransform {
  readonly allowedPhoneNumber = allowedPhoneNumber

  transform(value: any) {
    const { phoneNumber } = value;

    if(!allowedPhoneNumber.test(phoneNumber)) {
      throw new BadRequestException(content.PhoneNumberNotValid);
    }

    return value;
  }
}
