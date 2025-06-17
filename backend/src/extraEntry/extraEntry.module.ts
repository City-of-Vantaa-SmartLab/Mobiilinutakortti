import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module';
import { SessionDBModule } from '../session/sessionDb.module';
import { ExtraEntryService } from './extraEntry.service';
import { ExtraEntryController } from './extraEntry.controller';
import { ExtraEntry, EntryType } from './entities';
import { Junior } from '../junior/entities';
import { JuniorModule } from '../junior/junior.module';
import { EntryPermit } from './entities/entryPermit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExtraEntry, EntryType, Junior, EntryPermit]),
    JuniorModule,
    RolesModule,
    SessionDBModule,
  ],
  providers: [ExtraEntryService],
  controllers: [ExtraEntryController],
  exports: [ExtraEntryService]
})
export class ExtraEntryModule {}
