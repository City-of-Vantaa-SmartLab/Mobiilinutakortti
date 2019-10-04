import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AdminService } from '../admin/admin.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../authentication/constants';
import { JwtStrategy } from './jwt.strategy';
import { AuthenticationController } from './authentication.controller';

@Module({
  providers: [AuthenticationService, JwtStrategy],
  imports: [AdminService,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  exports: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule { }
