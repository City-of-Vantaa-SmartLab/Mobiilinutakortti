import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './youthWorker.controller';
import { AdminService } from './youthWorker.service';
import { Admin, Lockout } from './entities';
import { AuthenticationModule } from '../authentication/authentication.module';
import { Junior } from '../junior/entities';
import { SessionDBModule } from '../session/sessiondb.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Junior, Lockout]),
    forwardRef(() => AuthenticationModule),
    SessionDBModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule { }
