import { PipeTransform, BadRequestException } from '@nestjs/common';
import { allowedPhoneNumber } from './constants';
import * as content from '../../content';

// Custom pipe for handling "phoneNumber" and "parentsPhoneNumber" validation while adding/editing junior details
export class PhoneNumberValidationPipe implements PipeTransform {
  readonly allowedPhoneNumber = allowedPhoneNumber

  transform(value: any) {
    const { phoneNumber, parentsPhoneNumber, userData } = value;
    if (userData !== null && userData !== undefined) {
      if (!this.isPhoneNumberValid(userData.phoneNumber)) {
        throw new BadRequestException(content.PhoneNumberNotValid);
      } else if (!this.isPhoneNumberValid(userData.parentsPhoneNumber)) {
        throw new BadRequestException(content.ParentsPhoneNumberNotValid);
      }
      return value;
    } else {
      if (!this.isPhoneNumberValid(phoneNumber)) {
        throw new BadRequestException(content.PhoneNumberNotValid);
      } else if (!this.isPhoneNumberValid(parentsPhoneNumber)) {
        throw new BadRequestException(content.ParentsPhoneNumberNotValid);
      }
      return value;
    }
  }

  private isPhoneNumberValid(phoneNumber: any) {
    const isValid = this.allowedPhoneNumber.test(phoneNumber);
    return isValid;
  }
}
