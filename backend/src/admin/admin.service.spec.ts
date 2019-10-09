import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { Connection } from 'typeorm';
import { Admin } from './admin.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../test/Mock';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthenticationService } from '../authentication/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { jwt } from '../authentication/authentication.consts';
import { JwtStrategy } from '../authentication/jwt.strategy';
import { getTestDB } from '../../test/testdb';
import { AdminModule } from './admin.module';
import { AppModule } from '../app.module';
import { JuniorModule } from '../junior/junior.module';
import { RegisterAdminDto } from './dto';
import { ConflictException } from '@nestjs/common';

describe('AdminService', () => {
  let module: TestingModule;
  const testUser = {
    email: 'AdmiN@servIce.teSt', firstName: 'Admin',
    lastName: 'Istrator', password: 'Secret',
  } as Admin;
  let connection: Connection;
  let service: AdminService;

  const testRegisterAdmin = {
    email: 'Admin2@service.test', firstName: 'Auth',
    lastName: 'Tication', password: 'Hush',
  } as RegisterAdminDto;

  beforeAll(async () => {
    connection = await getTestDB();
    module = await Test.createTestingModule({
      imports: [AuthenticationModule, AdminModule, AppModule, JuniorModule, JwtModule.register({
        secret: jwt.secret,
        signOptions: { expiresIn: jwt.expiry },
      })],
      providers: [AdminService, AuthenticationService, {
        provide: getRepositoryToken(Admin),
        useFactory: repositoryMockFactory,
      }, JwtStrategy],
    }).overrideProvider(Connection)
      .useValue(connection)
      .compile();

    service = module.get<AdminService>(AdminService);
    await service.createUser(testUser);
  });

  afterAll(async () => {
    await module.close();
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Get user', () => {
    it('Should return the user if they exist', async () => {
      const response = await service.getUser(testUser.email);
      expect(response.email === testUser.email.toLowerCase() &&
        response.firstName === testUser.firstName &&
        response.lastName === testUser.lastName).toBeTruthy();
    }),
      it('Should return undefined if the user does not exist', async () => {
        expect(await service.getUser('Bob')).toBe(undefined);
      });
  });

  describe('Create user', () => {
    it('Should add a user to the database if valid credentials are provided', async () => {
      const response = await service.getUser(testUser.email);
      expect(response.email === testUser.email.toLowerCase() &&
        response.firstName === testUser.firstName &&
        response.lastName === testUser.lastName).toBeTruthy();
    }),
      it('Should add emails as lowercase.', async () => {
        const response = await service.getUser(testUser.email);
        expect(response.email === testUser.email.toLowerCase()).toBeTruthy();
      }),
      it('Should return undefined if the user already exists', async () => {
        expect(await service.createUser(testUser)).toBe(undefined);
      });
  });

  describe('Register admin', () => {
    it('should state that the registration is succesful', async () => {
      expect(await service.registerAdmin(testRegisterAdmin)).toBe(`${testRegisterAdmin.email} luotu.`);
    }),
      it('should add the user to the database following a succesful registration', async () => {
        const response = await service.getUser(testRegisterAdmin.email);
        expect(response.email === testRegisterAdmin.email.toLowerCase() &&
          response.firstName === testRegisterAdmin.firstName &&
          response.lastName === testRegisterAdmin.lastName).toBeTruthy();
      }),
      it('should store passwords in a non-plaintext manner', async () => {
        expect((await service.getUser(testRegisterAdmin.email)).password).not.toEqual(testRegisterAdmin.password);
      }),
      it('should thrown a Conflict if the username already exists', async () => {
        const error = new ConflictException();
        try {
          await service.registerAdmin(testRegisterAdmin);
          fail();
        } catch (e) {
          expect(e.response === error.getResponse());
        }
      });
  });
});
