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

  // SSO logout, redirect binding. Suomi.fi will redirect the user here after SP-initiated logout.
  @Get('slo')
  logoutRedirect(@Req() req: Request, @Res() res: Response) {
    this.ssoService.handleLogoutResponse(req, res);
  }

  // SSO logout, post binding. Suomi.fi will call this on IdP-initiated logouts.
  @Post('slo')
  logoutPost(@Req() req: Request, @Res() res: Response) {
    this.ssoService.handleLogoutRequest(req, res);
  }

}
