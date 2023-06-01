import { Module } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { ClubModule } from 'src/club/club.module';
import { SmsModule } from 'src/sms/sms.module';
import { JuniorModule } from 'src/junior/junior.module';
import { RolesModule } from '../roles/roles.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    ClubModule,
    JuniorModule,
    SmsModule,
    RolesModule,
    SessionModule
  ],
  providers: [AnnouncementService],
  controllers: [AnnouncementController],
  exports: [AnnouncementService]
})
export class InfoModule {}
