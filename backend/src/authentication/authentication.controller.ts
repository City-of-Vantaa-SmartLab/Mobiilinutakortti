import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SecurityContextDto } from './dto';
import { ContextValidViewModel } from './vm';
import * as content from '../content';
import { ApiTags } from '@nestjs/swagger';

@Controller(`${content.Routes.api}/auth`)
@ApiTags('Auth')
export class AuthenticationController {

  constructor(
    private readonly authenticationService: AuthenticationService,
  ) { }

  @Post('validate-signature')
  validateSignature(@Body() securityContext: SecurityContextDto): ContextValidViewModel {
    return new ContextValidViewModel(this.authenticationService.validateSecurityContext(securityContext));
  }
}
