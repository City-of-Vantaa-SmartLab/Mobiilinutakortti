import { Module, forwardRef } from '@nestjs/common';
import { JuniorService } from './junior.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Junior, Challenge } from './entities';
import { JuniorController } from './junior.controller';
import { AuthenticationModule } from '../authentication/authentication.module';
import { Admin } from '../admin/admin.entity';
import { SmsModule } from '../sms/sms.module';
import { SmsService } from '../sms/sms.service';

@Module({
  imports: [TypeOrmModule.forFeature([Junior, Admin, Challenge]),
  forwardRef(() => AuthenticationModule), SmsModule],
  controllers: [JuniorController],
  providers: [JuniorService],
  exports: [JuniorService],
})
export class JuniorModule { }
