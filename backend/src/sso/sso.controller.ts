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
  getLoginResponse(@Req() req: Request, @Res() res: Response) {
    this.ssoService.handleLoginRequest(req, res);
  }

  // Call this to initiate logout process.
  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    this.ssoService.getLogoutRequestUrl(req, res);
  }

  // SSO logout, redirect binding. Suomi.fi will redirect the user here after logout.
  @Get('slo')
  logoutRedirect(): string {
    // TODO: check status from query string samlresponse, it might have failed
    // TODO redirect to page that says logged out.
    return "LOGOUT OK";
  }

  // SSO logout, post binding. Suomi.fi will call this on 3rd party logouts?
  @Post('slo')
  logoutPost(): string {
    //TODO
    console.log("logout post");
    return null;
  }

}
