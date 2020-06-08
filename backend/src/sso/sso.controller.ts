import {
  Controller, Post, Body, Get, Res, Req, UseFilters, HttpException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SsoService } from './sso.service';
import { Routes } from '../content.json';

@Controller(`${Routes.api}`)
export class SsoController {

  constructor(
    private readonly ssoService: SsoService
  ) { }

  // Call this to initiate login process.
  @Get('acs')
  getLoginRequestUrl(@Res() res: Response) {
    this.ssoService.getLoginRequestUrl(res);
  }

  // This is called when coming back from Suomi.fi identification.
  @Post('acs')
  loginResponse(@Req() req: Request, @Res() res: Response) {
    this.ssoService.handleLoginResponse(req, res);
  }

  // Call this to initiate logout process.
  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    this.ssoService.getLogoutRequestUrl(req, res);
  }

  // SSO logout, redirect binding.
  // Suomi.fi will redirect the user here after SP-initiated logout: there will be a SAMLResponse in the query.
  // Suomi.fi will also call this on IdP-initiated logouts: there will be a SAMLRequest in the query.
  @Get('slo')
  logoutRedirect(@Req() req: Request, @Res() res: Response) {
    this.ssoService.handleLogout(req, res);
  }

}
