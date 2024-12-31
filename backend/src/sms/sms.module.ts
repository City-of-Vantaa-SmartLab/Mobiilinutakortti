import { ClubModule } from '../club/club.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';

@Module({
  imports: [
    ClubModule,
    HttpModule
  ],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule { }
