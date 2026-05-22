import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { getTestDB } from './testdb';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('AppController (e2e)', () => {
  let app;
  let connection: DataSource;

  beforeAll(async () => {
    // Create a connection to a test DB
    connection = await getTestDB();
    await connection.initialize();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getDataSourceToken())
      .useValue(connection)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (connection.isInitialized) {
      await connection.destroy();
    }
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('API is running');
  });
});
