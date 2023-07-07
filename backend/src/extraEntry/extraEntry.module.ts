import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module';
import { SessionDBModule } from '../session/sessiondb.module';
import { ExtraEntryService } from './extraEntry.service';
import { ExtraEntryController } from './extraEntry.controller';
import { ExtraEntryType } from './entities';
import { Junior } from 'src/junior/entities';
import { JuniorModule } from 'src/junior/junior.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExtraEntryType, Junior]),
    JuniorModule,
    RolesModule,
    SessionDBModule,
  ],
  providers: [ExtraEntryService],
  controllers: [ExtraEntryController],
  exports: [ExtraEntryService]
})
export class ExtraEntryModule {}
