import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module';
import { SessionDBModule } from '../session/sessiondb.module';
import { ExtraEntryService } from './extraEntry.service';
import { ExtraEntryController } from './extraEntry.controller';
import { ExtraEntryType } from './entities/extraEntryType';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExtraEntryType]),
    RolesModule,
    SessionDBModule,
  ],
  providers: [ExtraEntryService],
  controllers: [ExtraEntryController],
  exports: [ExtraEntryService]
})
export class ExtraEntryModule {}
