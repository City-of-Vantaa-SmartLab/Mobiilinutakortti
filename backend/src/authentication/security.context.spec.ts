import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { YouthWorker, Lockout } from '../youthWorker/entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../test/Mock';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthenticationService } from '../authentication/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { jwt } from '../authentication/authentication.consts';
import { JwtStrategy } from '../authentication/jwt.strategy';
import { getTestDB } from '../../test/testdb';
import { YouthWorkerModule } from '../youthWorker/youthWorker.module';
import { AppModule } from '../app.module';
import { JuniorModule } from '../junior/junior.module';
import { Challenge, Junior } from '../junior/entities';
import { SmsModule } from '../sms/sms.module';
import { SecurityContextDto, AcsDto } from './dto';
import { sign } from 'cookie-signature';
import { secretString } from './secret';

describe('AuthenticationService', () => {
  let module: TestingModule;
  let connection: DataSource;
  let service: AuthenticationService;

  beforeAll(async () => {
    connection = getTestDB();
    module = await Test.createTestingModule({
      imports: [AuthenticationModule, YouthWorkerModule, AppModule, JuniorModule, SmsModule, JwtModule.register({
        secret: jwt.secret,
      })],
      providers: [AuthenticationService, {
        provide: getRepositoryToken(YouthWorker),
        useFactory: repositoryMockFactory,
      }, {
        provide: getRepositoryToken(Junior),
        useFactory: repositoryMockFactory,
      },
        {
          provide: getRepositoryToken(Challenge),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Lockout),
          useFactory: repositoryMockFactory,
        }, JwtStrategy],
    }).overrideProvider(DataSource)
      .useValue(connection)
      .compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  afterAll(async () => {
    await module.close();
    await connection.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Security Context', () => {
    const sessionIndex = '12345';
    const nameId = 'test';
    const firstName = 'Test1';
    const lastName = 'Test2';
    const zipCode = '12345';
    let signedString = '';
    const twoHoursAgo = (new Date().getTime() / 1000) - (3600 * 2);
    const twoHoursLeft = (new Date().getTime() / 1000) + (3600 * 2);
    it('should generate security context', async () => {
      const acsData = { sessionIndex, nameId, firstName, lastName, zipCode } as AcsDto;
      const expectedSecurityContext = sign(`${sessionIndex} ${nameId} ${firstName} ${lastName} ${zipCode}`, secretString);
      signedString = service.generateSecurityContext(acsData).signedString;
      expect(signedString).toEqual(expectedSecurityContext);
    }),

      it('should validate security context to true ', async () => {
        const scData = {
          sessionIndex,
          nameId,
          firstName,
          lastName,
          zipCode,
          signedString,
          expiryTime: twoHoursLeft.toString(),
        } as SecurityContextDto;
        expect(service.validateSecurityContext(scData)).toEqual(true);
      }),

      it('should validate security context to false when expired ', async () => {
        const scData = {
          sessionIndex: '12345',
          nameId: 'test',
          firstName,
          lastName,
          zipCode,
          signedString,
          expiryTime: twoHoursAgo.toString(),
        } as SecurityContextDto;
        expect(service.validateSecurityContext(scData)).toEqual(false);
      }),

      it('should validate security context to false when signature wrong ', async () => {
        signedString = 'test';
        const scData = {
          sessionIndex: '12345',
          nameId: 'test',
          firstName,
          lastName,
          zipCode,
          signedString,
          expiryTime: twoHoursLeft.toString(),
        } as SecurityContextDto;
        expect(service.validateSecurityContext(scData)).toEqual(false);
      });
  });
});
