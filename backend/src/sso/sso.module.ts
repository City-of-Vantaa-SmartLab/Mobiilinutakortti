import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { SsoController } from './sso.controller';
import { SsoService } from './sso.service';

@Module({
  imports: [AuthenticationModule],
  controllers: [SsoController],
  providers: [SsoService],
  exports: [SsoService]
})
export class SsoModule { }
