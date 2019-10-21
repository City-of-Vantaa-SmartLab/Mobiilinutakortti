import { Module, HttpModule, HttpService } from '@nestjs/common';
import { SmsService } from './sms.service';

@Module({
  imports: [HttpModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule { }
