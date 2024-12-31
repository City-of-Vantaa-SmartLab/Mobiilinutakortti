import { AuthenticationModule } from '../authentication/authentication.module';
import { Module, forwardRef } from '@nestjs/common';
import { RolesModule } from '../roles/roles.module';
import { SessionDBModule } from '../session/sessiondb.module';
import { SessionModule } from '../session/session.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YouthWorkerController } from './youthWorker.controller';
import { YouthWorker, Lockout } from './entities';
import { YouthWorkerService } from './youthWorker.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([YouthWorker, Lockout]),
    forwardRef(() => AuthenticationModule),
    RolesModule,
    SessionModule,
    SessionDBModule
  ],
  controllers: [YouthWorkerController],
  providers: [YouthWorkerService],
  exports: [YouthWorkerService],
})
export class YouthWorkerModule { }
