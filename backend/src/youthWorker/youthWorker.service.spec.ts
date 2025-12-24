import { AppModule } from '../app.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthenticationService } from '../authentication/authentication.service';
import { ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getTestDB } from '../../test/testdb';
import { JuniorModule } from '../junior/junior.module';
import { jwtSecret } from '../authentication/authentication.consts';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../authentication/jwt.strategy';
import { RegisterYouthWorkerDto, EditYouthWorkerDto } from './dto';
import { repositoryMockFactory } from '../../test/Mock';
import { SessionDBModule } from '../session/sessionDb.module';
import { SessionModule } from '../session/session.module';
import { SpamGuardModule } from '../spamGuard/spamGuard.module';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YouthWorker, Lockout } from './entities';
import { YouthWorkerModule } from './youthWorker.module';
import { YouthWorkerService } from './youthWorker.service';

describe('YouthWorkerService', () => {
  let module: TestingModule;
  const testUser = {
    email: 'YouthWOrker@servIce.teSt', firstName: 'Youth',
    lastName: 'Worker', password: 'Secret',
  } as YouthWorker;
  let connection: DataSource;
  let service: YouthWorkerService;

  const testRegisterYouthWorker = {
    email: 'Worker2@service.test', firstName: 'Auth',
    lastName: 'Tication', password: 'Hush', isAdmin: true,
  } as RegisterYouthWorkerDto;

  let youthWorkerToEdit: EditYouthWorkerDto;

  beforeAll(async () => {
    connection = getTestDB();
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([YouthWorker, Lockout]), AuthenticationModule, YouthWorkerModule, AppModule, JuniorModule, SessionModule, SessionDBModule, SpamGuardModule, JwtModule.register({
        secret: jwtSecret,
      })],
      providers: [YouthWorkerService, AuthenticationService, {
        provide: getRepositoryToken(YouthWorker),
        useFactory: repositoryMockFactory,
      }, {
          provide: getRepositoryToken(Lockout),
          useFactory: repositoryMockFactory,
        }, JwtStrategy],
    }).overrideProvider(DataSource)
      .useValue(connection)
      .compile();
    await connection.initialize();

    service = module.get<YouthWorkerService>(YouthWorkerService);
    await service.createYouthWorker(testUser);
  });

  afterAll(async () => {
    await connection.destroy();
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Get user', () => {
    it('Should return the user if they exist', async () => {
      const response = await service.getYouthWorkerByEmail(testUser.email);
      expect(response.email === testUser.email.toLowerCase() &&
        response.firstName === testUser.firstName &&
        response.lastName === testUser.lastName).toBeTruthy();
    }),
      it('Should return null if the user does not exist', async () => {
        expect(await service.getYouthWorkerByEmail('Bob')).toBe(null);
      });
  });

  describe('Create user', () => {
    it('Should add a user to the database if valid credentials are provided', async () => {
      const response = await service.getYouthWorkerByEmail(testUser.email);
      expect(response.email === testUser.email.toLowerCase() &&
        response.firstName === testUser.firstName &&
        response.lastName === testUser.lastName &&
        response.isAdmin === testUser.isAdmin).toBeTruthy();
    }),
      it('Should add emails as lowercase.', async () => {
        const response = await service.getYouthWorkerByEmail(testUser.email);
        expect(response.email === testUser.email.toLowerCase()).toBeTruthy();
      }),
      it('Should return the user object when creating', async () => {
        const existingUser = await service.getYouthWorkerByEmail('test-unique@example.com');
        if (!existingUser) {
          const newUser = await service.createYouthWorker({ email: 'test-unique@example.com', firstName: 'Test', lastName: 'User', password: 'pass' } as YouthWorker);
          expect(newUser.email).toBe('test-unique@example.com');
        }
      });
  });

  describe('Register youth worker', () => {
    it('should state that the registration is succesful', async () => {
      const result = await service.registerYouthWorker(testRegisterYouthWorker);
      expect(result.email).toBe(testRegisterYouthWorker.email.toLowerCase());
    }),
      it('should add the user to the database following a succesful registration', async () => {
        const response = await service.getYouthWorkerByEmail(testRegisterYouthWorker.email);
        expect(response.email === testRegisterYouthWorker.email.toLowerCase() &&
          response.firstName === testRegisterYouthWorker.firstName &&
          response.lastName === testRegisterYouthWorker.lastName).toBeTruthy();
      }),
      it('should store passwords in a non-plaintext manner', async () => {
        expect((await service.getYouthWorkerByEmail(testRegisterYouthWorker.email)).password).not.toEqual(testRegisterYouthWorker.password);
      }),
      it('should thrown a Conflict if the username already exists', async () => {
        const error = new ConflictException();
        try {
          await service.registerYouthWorker(testRegisterYouthWorker);
          fail();
        } catch (e) {
          expect(e.response === error.getResponse());
        }
      });
  });

  describe('Get All Youth workers', () => {
    it('Should return an array containing all youth workers', async () => {
      const response = await service.listAllYouthWorkers();
      const isAnArray = Array.isArray(response);
      const containsYouthWorkers = response.some(e => e.email === testUser.email.toLowerCase());
      expect(isAnArray && containsYouthWorkers).toBeTruthy();
    });
  });

  describe('Edit Youth worker', () => {
    beforeAll(async () => {
      youthWorkerToEdit = (await service.listAllYouthWorkers())[0];
    }),
      it(' should change values if valid data is provided', async () => {
        const dto = {
          id: youthWorkerToEdit.id, firstName: youthWorkerToEdit.firstName, lastName: youthWorkerToEdit.lastName,
          email: 'NewEmail@groovy.com', isAdmin: false,
        } as EditYouthWorkerDto;
        await service.editYouthWorker(dto, '');
        const updatedYouthWorker = await service.getYouthWorkerByEmail(dto.email);
        const updatedList = await service.listAllYouthWorkers();
        expect(updatedYouthWorker.email === dto.email.toLowerCase() && updatedYouthWorker.isAdmin === dto.isAdmin
          && (!updatedList.some(e => e.email === youthWorkerToEdit.email.toLowerCase()))).toBeTruthy();
      });
  });

  // describe('Delete Youth worker', () => {
  //   let youthWorkerToDelete: string;
  //   beforeAll(async () => {
  //     youthWorkerToDelete = (await service.listAllYouthWorkers())[0].id;
  //   }),
  //     it('Should delete the user provided', async () => {
  //       await service.deleteYouthWorker(youthWorkerToDelete, '');
  //       const YouthWorkerList = await service.listAllYouthWorkers();
  //       expect(YouthWorkerList.findIndex(a => a.id === youthWorkerToDelete) < 0);
  //     });
  // });
});
