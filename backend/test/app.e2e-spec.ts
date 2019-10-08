import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'typeorm';
import { getTestDB } from './testdb';

describe('AppController (e2e)', () => {
  let app;
  let connection: Connection;

  beforeAll(async () => {
    // Create a connection to a test DB
    connection = await getTestDB();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(Connection)
      .useValue(connection)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('API is running');
  });
});
