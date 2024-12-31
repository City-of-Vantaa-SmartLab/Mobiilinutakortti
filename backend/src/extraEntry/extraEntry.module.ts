import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module';
import { SessionDBModule } from '../session/sessiondb.module';
import { ExtraEntryService } from './extraEntry.service';
import { ExtraEntryController } from './extraEntry.controller';
import { ExtraEntry, ExtraEntryType } from './entities';
import { Junior } from '../junior/entities';
import { JuniorModule } from '../junior/junior.module';
import { Permit } from './entities/permit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExtraEntry, ExtraEntryType, Junior, Permit]),
    JuniorModule,
    RolesModule,
    SessionDBModule,
  ],
  providers: [ExtraEntryService],
  controllers: [ExtraEntryController],
  exports: [ExtraEntryService]
})
export class ExtraEntryModule {}
