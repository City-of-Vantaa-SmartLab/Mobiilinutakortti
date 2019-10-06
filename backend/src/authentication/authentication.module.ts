import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationService } from './authentication.service';
import { AdminModule } from '../admin/admin.module';
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
