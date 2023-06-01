import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YouthWorkerController } from './youthWorker.controller';
import { YouthWorkerService } from './youthWorker.service';
import { YouthWorker, Lockout } from './entities';
import { AuthenticationModule } from '../authentication/authentication.module';
import { SessionDBModule } from '../session/sessiondb.module';
import { RolesModule } from '../roles/roles.module';
import { SessionModule } from '../session/session.module';

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
