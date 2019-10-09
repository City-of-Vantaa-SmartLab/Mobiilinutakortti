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
import { Junior } from '../junior/junior.entity';
import { JuniorService } from '../junior/junior.service';
import { JuniorModule } from '../junior/junior.module';
import { RegisterJuniorDto, LoginJuniorDto } from '../junior/dto';

describe('AuthenticationService', () => {
  let module: TestingModule;
  let connection: Connection;
  let service: AuthenticationService;
  let adminService: AdminService;
  let juniorService: JuniorService;

  const testRegisterAdmin = {
    email: 'Authentication@service.test', firstName: 'Auth',
    lastName: 'Tication', password: 'Hush',
  } as RegisterAdminDto;
  const testLoginAdmin = {
    email: testRegisterAdmin.email, password: testRegisterAdmin.password,
  } as LoginAdminDto;
  const testRegisterYouth = {
    phoneNumber: '+4407805160073', firstName: 'Auth jr', lastName: 'Senior',
  } as RegisterJuniorDto;
  let testLoginYouth: LoginJuniorDto;

  beforeAll(async () => {
    connection = await getTestDB();
    module = await Test.createTestingModule({
      imports: [AuthenticationModule, AdminModule, AppModule, JuniorModule, JwtModule.register({
        secret: jwt.secret,
        signOptions: { expiresIn: jwt.expiry },
      })],
      providers: [AdminService, AuthenticationService, JuniorService, {
        provide: getRepositoryToken(Admin),
        useFactory: repositoryMockFactory,
      }, {
          provide: getRepositoryToken(Junior),
          useFactory: repositoryMockFactory,
        }, JwtStrategy],
    }).overrideProvider(Connection)
      .useValue(connection)
      .compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    adminService = module.get<AdminService>(AdminService);
    juniorService = module.get<JuniorService>(JuniorService);

    await adminService.registerAdmin(testRegisterAdmin);
    testLoginYouth = { phoneNumber: testRegisterYouth.phoneNumber, pin: await juniorService.registerJunior(testRegisterYouth) };
  });

  afterAll(async () => {
    await module.close();
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Login admin', () => {
    it('should return a access token token if login is succseful', async () => {
      expect((await service.loginAdmin(testLoginAdmin)).access_token).toBeDefined();
    }),
      it('should throw a Bad Request if the user does not exist', async () => {
        const error = new BadRequestException();
        try {
          const testData = { email: 'email@e.mail', password: testLoginAdmin.password } as LoginAdminDto;
          await service.loginAdmin(testData);
          fail();
        } catch (e) {
          expect(e.response === error.getResponse());
        }
      }),
      it('should throw a Unauthorized if the password is incorrect', async () => {
        const error = new UnauthorizedException();
        try {
          const testData = { email: testLoginAdmin.email, password: 'doubleHush' } as LoginAdminDto;
          await service.loginAdmin(testData);
          fail();
        } catch (e) {
          expect(e.response === error.getResponse());
        }
      });
  });

  describe('Login Youth', () => {
    it('should return a access token token if login is succseful', async () => {
      expect((await service.loginJunior(testLoginYouth)).access_token).toBeDefined();
    }),
      it('should throw a Bad Request if the user does not exist', async () => {
        const error = new BadRequestException();
        try {
          const testData = { phoneNumber: testLoginYouth.phoneNumber, pin: '12345' } as LoginJuniorDto;
          await service.loginJunior(testData);
          fail();
        } catch (e) {
          expect(e.response === error.getResponse());
        }
      }),
      it('should throw a Unauthorized if the pin is incorrect', async () => {
        const error = new BadRequestException();
        try {
          const testData = { phoneNumber: '4407805160079', pin: testLoginYouth.pin } as LoginJuniorDto;
          await service.loginJunior(testData);
          fail();
        } catch (e) {
          expect(e.response === error.getResponse());
        }
      });
  });
});
