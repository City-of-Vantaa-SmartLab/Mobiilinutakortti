import { Module, forwardRef } from '@nestjs/common';
import { JuniorService } from './junior.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Junior, Challenge } from './entities';
import { JuniorController } from './junior.controller';
import { AuthenticationModule } from '../authentication/authentication.module';
import { YouthWorker } from '../youthWorker/entities';
import { SmsModule } from '../sms/sms.module';
import { SessionDBModule } from '../session/sessiondb.module';
import { RolesModule } from '../roles/roles.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Junior, YouthWorker, Challenge]),
    forwardRef(() => AuthenticationModule),
    SmsModule,
    SessionDBModule,
    RolesModule,
    SessionModule
  ],
  controllers: [JuniorController],
  providers: [JuniorService],
  exports: [JuniorService],
})
export class JuniorModule { }
