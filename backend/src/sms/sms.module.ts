import { Module, HttpModule } from '@nestjs/common';
import { SmsService } from './sms.service';
import { ClubService } from 'src/club/club.service';
import { Junior } from 'src/junior/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckIn, Club } from 'src/club/entities';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Junior, CheckIn, Club]),
  ],
  providers: [SmsService, ClubService],
  exports: [SmsService, ClubService],
})
export class SmsModule { }
