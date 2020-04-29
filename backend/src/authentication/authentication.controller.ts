import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { SessionDataDto, AcsDto } from './dto';
import { SessionValidationResponseViewModel } from './vm';
import * as content from '../content.json';
import { unsign } from 'cookie-signature';
import * as moment from 'moment';
import { secretString } from './secret';

@Controller(`${content.Routes.api}/auth`)
export class AuthenticationController {

  @Post('validate-signature')
  validateSignature(@Body() sessionData: SessionDataDto): SessionValidationResponseViewModel {
    const { firstName, lastName, zipCode } = sessionData;
    const timestampValid = moment(sessionData.expireTime).isAfter(moment(Date.now()));
    const signatureValid = unsign(sessionData.signedString, secretString) === `${firstName} ${lastName} ${zipCode}`;
    return new SessionValidationResponseViewModel(signatureValid && timestampValid);
  }
}
