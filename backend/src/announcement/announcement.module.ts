import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';
import { ClubModule } from '../club/club.module';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { JuniorModule } from '../junior/junior.module';
import { Module } from '@nestjs/common';
import { RolesModule } from '../roles/roles.module';
import { SessionDBModule } from '../session/sessionDb.module';
import { SessionModule } from '../session/session.module';
import { SmsModule } from '../sms/sms.module';

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
