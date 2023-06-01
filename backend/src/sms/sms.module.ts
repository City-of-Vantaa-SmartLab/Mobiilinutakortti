import { Module, HttpModule } from '@nestjs/common';
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
