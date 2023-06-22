import { Module } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { ClubModule } from 'src/club/club.module';
import { SmsModule } from 'src/sms/sms.module';
import { JuniorModule } from 'src/junior/junior.module';
import { RolesModule } from '../roles/roles.module';
import { SessionModule } from '../session/session.module';
import { SessionDBModule } from '../session/sessiondb.module';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [
    ClubModule,
    JuniorModule,
    SmsModule,
    RolesModule,
    SessionModule,
    SessionDBModule,
    EmailModule
  ],
  providers: [AnnouncementService, EmailService],
  controllers: [AnnouncementController],
  exports: [AnnouncementService]
})
export class AnnouncementModule {}
