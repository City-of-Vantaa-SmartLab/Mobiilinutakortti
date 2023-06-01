import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationService } from './authentication.service';
import { YouthWorkerModule } from '../youthWorker/youthWorker.module';
import { jwt } from './authentication.consts';
import { JwtStrategy } from './jwt.strategy';
import { JuniorModule } from '../junior/junior.module';
import { SessionDBModule } from '../session/sessiondb.module';

@Module({
  imports: [
    forwardRef(() => YouthWorkerModule),
    forwardRef(() => JuniorModule),
    PassportModule,
    SessionDBModule,
    JwtModule.register({
      secret: jwt.secret,
    })
  ],
  providers: [AuthenticationService, JwtStrategy],
  exports: [AuthenticationService],
})
export class AuthenticationModule { }
