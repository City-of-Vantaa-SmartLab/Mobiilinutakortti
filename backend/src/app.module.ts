import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigHelper } from './configHandler';

@Module({
  imports: [
    TypeOrmModule.forRoot(ConfigHelper.getDatabaseConnection()),
    AdminModule,
    AuthenticationModule,
  ],
  controllers: [AppController, AdminController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly connection: Connection) { }
}
