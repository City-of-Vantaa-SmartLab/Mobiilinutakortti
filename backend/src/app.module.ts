import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'nuta',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AdminModule,
    AuthenticationModule,
  ],
  controllers: [AppController, AdminController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly connection: Connection) { }
}
