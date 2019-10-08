import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../admin/admin.service';
import { Connection } from 'typeorm';
import { Admin } from '../admin/admin.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../test/Mock';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthenticationService } from '../authentication/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { jwt } from '../authentication/authentication.consts';
import { JwtStrategy } from '../authentication/jwt.strategy';
import { getTestDB } from '../../test/testdb';
import { AdminModule } from '../admin/admin.module';
import { AppModule } from '../app.module';
import { RegisterAdminDto, LoginAdminDto } from '../admin/dto';
import { ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthenticationService', () => {
  let module: TestingModule;
  let connection: Connection;
  let service: AuthenticationService;
  let adminService: AdminService;

  const testRegister = {
    email: 'Authentication@service.test', firstName: 'Auth',
    lastName: 'Tication', password: 'Hush',
  } as RegisterAdminDto;
  const testLogin = {
    email: testRegister.email, password: testRegister.password,
  } as LoginAdminDto;

  beforeAll(async () => {
    connection = await getTestDB();
    module = await Test.createTestingModule({
      imports: [AuthenticationModule, AdminModule, AppModule, JwtModule.register({
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

    service = module.get<AuthenticationService>(AuthenticationService);
    adminService = module.get<AdminService>(AdminService);
  });

  afterAll(async () => {
    await module.close();
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Register admin', () => {
    it('should state that the registration is succesful', async () => {
      expect(await service.registerAdmin(testRegister)).toBe(`${testRegister.email} luotu.`);
    }),
      it('should add the user to the database following a succesful registration', async () => {
        const response = await adminService.getUser(testRegister.email);
        expect(response.email === testRegister.email.toLowerCase() &&
          response.firstName === testRegister.firstName &&
          response.lastName === testRegister.lastName).toBeTruthy();
      }),
      it('should store passwords in a non-plaintext manner', async () => {
        expect((await adminService.getUser(testRegister.email)).password).not.toEqual(testRegister.password);
      }),
      it('should thrown a Conflict if the username already exists', async () => {
        const error = new BadRequestException();
        try {
          await service.registerAdmin(testRegister);
          fail();
        } catch (e) {
          expect(e.name === error.name);
        }
      });
  });

  describe('Login admin', () => {
    it('should return a access token token if login is succseful', async () => {
      expect((await service.loginAdmin(testLogin)).access_token).toBeDefined();
    }),
      it('should throw a Bad Request if the user does not exist', async () => {
        const error = new BadRequestException();
        try {
          const testData = { email: 'email@e.mail', password: testLogin.password } as LoginAdminDto;
          await service.loginAdmin(testData);
          fail();
        } catch (e) {
          expect(e.name === error.name);
        }
      }),
      it('should throw a Unauthorized if the password is incorrect', async () => {
        const error = new UnauthorizedException();
        try {
          const testData = { email: testLogin.email, password: 'doubleHush' } as LoginAdminDto;
          await service.loginAdmin(testData);
          fail();
        } catch (e) {
          expect(e.name === error.name);
        }
      });
  });
});
