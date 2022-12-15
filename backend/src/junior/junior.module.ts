import { Module, forwardRef } from '@nestjs/common';
import { JuniorService } from './junior.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Junior, Challenge } from './entities';
import { JuniorController } from './junior.controller';
import { AuthenticationModule } from '../authentication/authentication.module';
import { Admin } from '../admin/entities';
import { SmsModule } from '../sms/sms.module';
import { SessionDBModule } from '../session/sessiondb.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Junior, Admin, Challenge]),
    forwardRef(() => AuthenticationModule),
    SmsModule,
    SessionDBModule
  ],
  controllers: [JuniorController],
  providers: [JuniorService],
  exports: [JuniorService],
})
export class JuniorModule { }
