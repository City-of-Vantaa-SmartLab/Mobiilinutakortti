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
import { forwardRef, ConflictException } from '@nestjs/common';
import { RegisterJuniorDto, LoginJuniorDto } from './dto';

describe('JuniorService', () => {
  let module: TestingModule;
  let service: JuniorService;
  let connection: Connection;

  const testRegisterYouth = {
    phoneNumber: '+4407805140073', firstName: 'Auth jr', lastName: 'Senior',
  } as RegisterJuniorDto;
  let testLoginYouth: LoginJuniorDto;

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
  });

  afterAll(async () => {
    await module.close();
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Register Youth', () => {
    it('should return a value (currently pin whilst waiting for further workflow)', async () => {
      testLoginYouth = {
        phoneNumber: testRegisterYouth.phoneNumber, pin: await service.registerJunior(testRegisterYouth),
      };
      expect(testLoginYouth.pin).toBeDefined();
    }),
      it('should add the user to the database following a succesful registration', async () => {
        const response = await service.getUser(testRegisterYouth.phoneNumber);
        expect(response.phoneNumber === testRegisterYouth.phoneNumber.toLowerCase() &&
          response.firstName === testRegisterYouth.firstName &&
          response.lastName === testRegisterYouth.lastName).toBeTruthy();
      }),
      it('should thrown a Conflict if the phone number already exists', async () => {
        const error = new ConflictException();
        try {
          await service.registerJunior(testRegisterYouth);
          fail();
        } catch (e) {
          expect(e.response === error.getResponse());
        }
      });
  });
});
