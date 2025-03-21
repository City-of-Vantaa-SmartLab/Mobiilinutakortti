import { AuthenticationService } from './authentication.service';
import { JuniorModule } from '../junior/junior.module';
import { jwt } from './authentication.consts';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { Module, forwardRef } from '@nestjs/common';
import { SessionDBModule } from '../session/sessionDb.module';
import { YouthWorkerModule } from '../youthWorker/youthWorker.module';

@Module({
  imports: [
    forwardRef(() => YouthWorkerModule),
    forwardRef(() => JuniorModule),
    SessionDBModule,
    JwtModule.register({
      secret: jwt.secret,
    })
  ],
  providers: [AuthenticationService, JwtStrategy],
  exports: [AuthenticationService],
})
export class AuthenticationModule { }
