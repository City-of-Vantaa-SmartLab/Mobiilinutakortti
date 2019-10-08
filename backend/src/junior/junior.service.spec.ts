import { Test, TestingModule } from '@nestjs/testing';
import { JuniorService } from './junior.service';
import { JuniorModule } from './junior.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Junior } from './junior.entity';
import { repositoryMockFactory } from '../../test/Mock';
import { AppModule } from '../app.module';
import { Connection } from 'typeorm';
import { getTestDB } from '../../test/testdb';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AdminModule } from '../admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { jwt } from '../authentication/authentication.consts';
import { AuthenticationService } from '../authentication/authentication.service';
import { JwtStrategy } from '../authentication/jwt.strategy';
import { Admin } from '../admin/admin.entity';
import { AdminService } from '../admin/admin.service';
import { forwardRef } from '@nestjs/common';

describe('JuniorService', () => {
  let module: TestingModule;
  let service: JuniorService;
  let connection: Connection;
  let adminService: AdminService;

  beforeAll(async () => {
    connection = await getTestDB();
    module = await Test.createTestingModule({
      imports: [AppModule, JuniorModule, AdminModule, AuthenticationModule],
      providers: [JuniorService, {
        provide: getRepositoryToken(Admin),
        useFactory: repositoryMockFactory,
      }, {
          provide: getRepositoryToken(Junior),
          useFactory: repositoryMockFactory,
        }],
    }).overrideProvider(Connection)
      .useValue(connection)
      .compile();

    service = module.get<JuniorService>(JuniorService);
    adminService = module.get<AdminService>(AdminService);
  });

  afterAll(async () => {
    await module.close();
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
