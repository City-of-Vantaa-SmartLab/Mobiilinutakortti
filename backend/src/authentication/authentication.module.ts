import { Module, forwardRef } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { PassportModule } from '@nestjs/passport';
import { AdminModule } from '../admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { jwt } from './authentication.consts';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [forwardRef(() => AdminModule), PassportModule,
  JwtModule.register({
    secret: jwt.secret,
    signOptions: { expiresIn: jwt.expiry },
  })],
  providers: [AuthenticationService, JwtStrategy],
  exports: [AuthenticationService],
})
export class AuthenticationModule { }
