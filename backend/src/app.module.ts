import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigHelper } from './configHandler';
import { JuniorModule } from './junior/junior.module';
import { JuniorController } from './junior/junior.controller';
import { AppService } from './app.service';
import { GuardsModule } from './roles/roles.module';
import { Admin } from './admin/admin.entity';
import { Junior } from './junior/entities';

@Module({
  imports: [
    TypeOrmModule.forRoot(ConfigHelper.getDatabaseConnection()),
    TypeOrmModule.forFeature([Admin, Junior]),
    AdminModule,
    JuniorModule,
    AuthenticationModule,
    GuardsModule,
  ],
  providers: [AppService],
  controllers: [AppController, AdminController, JuniorController],
})
export class AppModule {
  constructor(private readonly connection: Connection) { }
}
