import { Module } from '@nestjs/common';
import { InfoService } from './info.service';
import { InfoController } from './info.controller';
import { ClubModule } from 'src/club/club.module';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [
    ClubModule, SmsModule, 
  ],
  providers: [InfoService],
  controllers: [InfoController],
  exports: [InfoService]
})
export class InfoModule {}
