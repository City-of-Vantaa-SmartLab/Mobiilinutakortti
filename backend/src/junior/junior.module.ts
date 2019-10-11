import { Module, forwardRef } from '@nestjs/common';
import { JuniorService } from './junior.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Junior } from './junior.entity';
import { JuniorController } from './junior.controller';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AdminModule } from '../admin/admin.module';
import { Admin } from '../admin/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Junior, Admin]),
  forwardRef(() => AuthenticationModule), forwardRef(() => AdminModule)],
  controllers: [JuniorController],
  providers: [JuniorService],
  exports: [JuniorService],
})
export class JuniorModule { }
