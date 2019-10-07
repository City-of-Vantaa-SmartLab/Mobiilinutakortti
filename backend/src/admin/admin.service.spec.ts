import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { Repository, createConnection, Connection } from 'typeorm';
import { Admin } from './admin.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const connection = await createConnection({
      type: 'sqlite',
      database: './testdb.sql',
      entities: ['src/entities/*.entity{.ts,.js}'],
      synchronize: true,
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService],
    })
      .overrideProvider(Connection)
      .useValue(connection)
      .compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
