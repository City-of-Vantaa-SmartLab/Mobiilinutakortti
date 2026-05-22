import {
  Controller, Post, Get, Res, Req
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SsoService } from './sso.service';
import { Routes } from '../content';
import { ApiTags } from '@nestjs/swagger';

@Controller(`${Routes.api}`)
@ApiTags('Sso')
export class SsoController {

  constructor(
    private readonly ssoService: SsoService
  ) { }

  // Call this to initiate login process.
  @Get('acs')
  async getLoginRequestUrl(@Res() res: Response) {
    await this.ssoService.getLoginRequestUrl(res);
  }

  // This is called by the user's browser when the user returns from Suomi.fi identification.
  @Post('acs')
  async loginResponse(@Req() req: Request, @Res() res: Response) {
    await this.ssoService.handleLoginResponse(req, res);
  }

  // Call this to initiate logout process.
  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    await this.ssoService.getLogoutRequestUrl(req, res);
  }

  // SSO logout, redirect binding.
  // Suomi.fi will redirect the user here after SP-initiated logout: there will be a SAMLResponse in the query.
  // Suomi.fi will also call this on IdP-initiated logouts: there will be a SAMLRequest in the query.
  @Get('slo')
  async logoutRedirect(@Req() req: Request, @Res() res: Response) {
    await this.ssoService.handleLogout(req, res);
  }

}
