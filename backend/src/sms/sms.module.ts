import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SmsService } from './sms.service';
import { ClubModule } from 'src/club/club.module';

@Module({
  imports: [
    ClubModule,
    HttpModule
  ],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule { }
