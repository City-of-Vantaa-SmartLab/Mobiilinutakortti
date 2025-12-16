import { PipeTransform, BadRequestException } from '@nestjs/common';
import { allowedPhoneNumber } from './constants';
import * as content from '../../content';

// Custom pipe for handling "phoneNumber" and "parentsPhoneNumber" validation while adding/editing junior details
export class PhoneNumberValidationPipe implements PipeTransform {
  transform(value: any) {
    const { phoneNumber, parentsPhoneNumber, userData } = value;
    if (userData !== null && userData !== undefined) {
      if (!allowedPhoneNumber.test(userData.phoneNumber)) {
        throw new BadRequestException(content.PhoneNumberNotValid);
      } else if (!allowedPhoneNumber.test(userData.parentsPhoneNumber)) {
        throw new BadRequestException(content.ParentsPhoneNumberNotValid);
      }
      return value;
    } else {
      if (!allowedPhoneNumber.test(phoneNumber)) {
        throw new BadRequestException(content.PhoneNumberNotValid);
      } else if (!allowedPhoneNumber.test(parentsPhoneNumber)) {
        throw new BadRequestException(content.ParentsPhoneNumberNotValid);
      }
      return value;
    }
  }
}
