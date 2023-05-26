import { Module, HttpModule } from '@nestjs/common';
import { SmsService } from './sms.service';
import { Junior } from 'src/junior/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckIn, Club } from 'src/club/entities';
import { ClubModule } from 'src/club/club.module';

@Module({
  imports: [
    ClubModule,
    HttpModule,
    TypeOrmModule.forFeature([Junior, CheckIn, Club]),
  ],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule { }
