import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { YouthWorkerController } from './youthWorker/youthWorker.controller';
import { YouthWorkerModule } from './youthWorker/youthWorker.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthenticationController } from './authentication/authentication.controller';
import { ConfigHandler } from './configHandler';
import { JuniorModule } from './junior/junior.module';
import { JuniorController } from './junior/junior.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { SessionModule } from './session/session.module';
import { SessionDBModule } from './session/sessionDb.module';
import { ClubModule } from './club/club.module';
import { SmsModule } from './sms/sms.module';
import { RoutersMiddleware } from './middleware/routers.middleware';
import { ConfigModule } from '@nestjs/config';
import { SsoModule } from './sso/sso.module';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';
import { AnnouncementModule } from './announcement/announcement.module';
import { AnnouncementController } from './announcement/announcement.controller';
import { ExtraEntryModule } from './extraEntry/extraEntry.module';
import { ExtraEntryController } from './extraEntry/extraEntry.controller';
import { KompassiModule } from './kompassi/kompassi.module';
import { SpamGuardModule } from './spamGuard/spamGuard.module';
import { SpamGuardController } from './spamGuard/spamGuard.controller';
import pino from 'pino';

@Module({
  imports: [
    TypeOrmModule.forRoot(ConfigHandler.getTypeOrmModuleConfig()),
    YouthWorkerModule,
    JuniorModule,
    AuthenticationModule,
    RolesModule,
    SessionModule,
    SessionDBModule,
    ClubModule,
    SmsModule,
    SsoModule,
    AnnouncementModule,
    ExtraEntryModule,
    KompassiModule,
    SpamGuardModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        useLevel: process.env.HTTP_LOG_LEVEL ? process.env.HTTP_LOG_LEVEL as pino.LevelWithSilent : 'info'
      }
    })
  ],
  providers: [AppService],
  controllers: [
    AppController,
    YouthWorkerController,
    JuniorController,
    AuthenticationController,
    AnnouncementController,
    ExtraEntryController,
    SpamGuardController
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RoutersMiddleware).forRoutes('/**');
  }

  constructor() { }
}
