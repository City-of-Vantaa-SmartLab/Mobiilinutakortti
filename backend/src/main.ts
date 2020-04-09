import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { ConfigHelper } from './configHandler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use('/', express.static(join(__dirname, '..', 'public')));
  app.use('/', express.static(join(__dirname, '..', 'public-admin')));
  await app.listen(process.env.APPLICATION_PORT || 3000);
}
bootstrap();
