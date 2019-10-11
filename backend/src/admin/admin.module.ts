import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './admin.entity';
import { AuthenticationModule } from '../authentication/authentication.module';
import { Junior } from '../junior/junior.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Junior]),
  forwardRef(() => AuthenticationModule)],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule { }
