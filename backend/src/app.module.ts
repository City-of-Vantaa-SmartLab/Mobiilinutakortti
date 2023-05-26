import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { YouthWorkerController } from './youthWorker/youthWorker.controller';
import { YouthWorkerModule } from './youthWorker/youthWorker.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthenticationController } from './authentication/authentication.controller';
import { ConfigHelper } from './configHandler';
import { JuniorModule } from './junior/junior.module';
import { JuniorController } from './junior/junior.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { SessionModule } from './session/session.module';
import { YouthWorker } from './youthWorker/entities';
import { Junior } from './junior/entities';
import { ClubModule } from './club/club.module';
import { SmsModule } from './sms/sms.module';
import { RoutersMiddleware } from './middleware/routers.middleware';
import { ConfigModule } from '@nestjs/config';
import { SsoModule } from './sso/sso.module';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionDBModule } from './session/sessiondb.module';
import { InfoModule } from './info/info.module';
import pino from 'pino';
import { InfoController } from './info/info.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(ConfigHelper.getDatabaseConnection()),
    TypeOrmModule.forFeature([YouthWorker, Junior]),
    YouthWorkerModule,
    JuniorModule,
    AuthenticationModule,
    RolesModule,
    SessionModule,
    ClubModule,
    SmsModule,
    SsoModule,
    SessionDBModule,
    InfoModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        useLevel: process.env.HTTP_LOG_LEVEL ? process.env.HTTP_LOG_LEVEL as pino.LevelWithSilent : 'info'
      }
    })
  ],
  providers: [AppService],
  controllers: [AppController, YouthWorkerController, JuniorController, AuthenticationController, InfoController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RoutersMiddleware).forRoutes('/**');
  }

  constructor(private readonly connection: Connection) { }
}
