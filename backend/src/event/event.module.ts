import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Junior } from '../junior/entities';
import { Event } from './event.entity';
import { CheckIn } from '../checkIn/checkIn.entity';
import { EntryType, ExtraEntry } from '../extraEntry/entities';
import { EntryPermit } from '../extraEntry/entities/entryPermit.entity';
import { EventController } from './event.controller';
import { jwtSecret } from '../authentication/authentication.consts';
import { JwtModule } from '@nestjs/jwt';
import { SessionDBModule } from '../session/sessionDb.module';
import { RolesModule } from '../roles/roles.module';
import { SessionModule } from '../session/session.module';
import { KompassiModule } from '../kompassi/kompassi.module';
import { SpamGuardModule } from '../spamGuard/spamGuard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Junior, Event, CheckIn, EntryType, ExtraEntry, EntryPermit]),
    JwtModule.register({
      secret: jwtSecret,
    }),
    SessionDBModule,
    RolesModule,
    SessionModule,
    KompassiModule,
    SpamGuardModule
  ],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService]
})
export class EventModule { }
