import { Module, forwardRef } from '@nestjs/common';
import { JuniorService } from './junior.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Junior } from './junior.entity';
import { JuniorController } from './junior.controller';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [TypeOrmModule.forFeature([Junior]),
  forwardRef(() => AuthenticationModule)],
  controllers: [JuniorController],
  providers: [JuniorService],
  exports: [JuniorService],
})
export class JuniorModule { }
