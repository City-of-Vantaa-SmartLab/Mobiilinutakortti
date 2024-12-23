import { Module } from '@nestjs/common';
import { ClubService } from './club.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Junior } from '../junior/entities';
import { Club, CheckIn } from './entities';
import { ClubController } from './club.controller';
import { jwt } from '../authentication/authentication.consts';
import { JwtModule } from '@nestjs/jwt';
import { SessionDBModule } from '../session/sessiondb.module';
import { RolesModule } from '../roles/roles.module';
import { SessionModule } from '../session/session.module';
import { KompassiModule } from '../kompassi/kompassi.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Junior, Club, CheckIn]),
    JwtModule.register({
      secret: jwt.secret,
    }),
    SessionDBModule,
    RolesModule,
    SessionModule,
    KompassiModule
  ],
  providers: [ClubService],
  controllers: [ClubController],
  exports: [ClubService]
})
export class ClubModule { }
