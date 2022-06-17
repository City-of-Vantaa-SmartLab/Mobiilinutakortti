import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';
import * as content from './content';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get(`${content.Routes.api}`)
  getStatus(): string {
    return this.appService.getStatus();
  }
}
