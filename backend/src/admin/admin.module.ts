import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YouthWorkerController } from './admin.controller';
import { YouthWorkerService } from './admin.service';
import { YouthWorker, Lockout } from './entities';
import { AuthenticationModule } from '../authentication/authentication.module';
import { Junior } from '../junior/entities';
import { SessionDBModule } from '../session/sessiondb.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([YouthWorker, Junior, Lockout]),
    forwardRef(() => AuthenticationModule),
    SessionDBModule
  ],
  controllers: [YouthWorkerController],
  providers: [YouthWorkerService],
  exports: [YouthWorkerService],
})
export class YouthWorkerModule { }
