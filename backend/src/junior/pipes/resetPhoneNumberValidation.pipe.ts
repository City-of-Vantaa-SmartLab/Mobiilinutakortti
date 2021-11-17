import { PipeTransform, BadRequestException } from "@nestjs/common";
import { allowedPhoneNumber } from "./constants";
import * as content from '../../content.json';

// Custom pipe for handling "phoneNumber" validation while resending SMS
export class ResetPhoneNumberValidationPipe implements PipeTransform {
  readonly allowedPhoneNumber = allowedPhoneNumber

  transform(value: any) {
    const { phoneNumber } = value;

    if(!this.isPhoneNumberValid(phoneNumber)) {
      throw new BadRequestException(content.PhoneNumberNotValid);
    }

    return value;
  }

  private isPhoneNumberValid(phoneNumber: any) {
    const isValid = this.allowedPhoneNumber.test(phoneNumber);
    return isValid;
  }
}