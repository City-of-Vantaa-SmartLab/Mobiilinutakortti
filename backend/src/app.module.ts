import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthenticationController } from './authentication/authentication.controller';
import { ConfigHelper } from './configHandler';
import { JuniorModule } from './junior/junior.module';
import { JuniorController } from './junior/junior.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { Admin } from './admin/entities';
import { Junior } from './junior/entities';
import { ClubModule } from './club/club.module';
import { SmsModule } from './sms/sms.module';
import { RoutersMiddleware } from './middleware/routers.middleware';
import { ConfigModule } from '@nestjs/config';
import { SsoModule } from './sso/sso.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(ConfigHelper.getDatabaseConnection()),
    TypeOrmModule.forFeature([Admin, Junior]),
    AdminModule,
    JuniorModule,
    AuthenticationModule,
    RolesModule,
    ClubModule,
    SmsModule,
    SsoModule,
    ConfigModule.forRoot(),
  ],
  providers: [AppService],
  controllers: [AppController, AdminController, JuniorController, AuthenticationController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RoutersMiddleware).forRoutes('/**');
  }

  constructor(private readonly connection: Connection) { }
}
