import { AppModule } from '../app.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthenticationService } from '../authentication/authentication.service';
import { DataSource } from 'typeorm';
import { getTestDB } from '../../test/testdb';
import { JuniorModule } from '../junior/junior.module';
import { jwt } from '../authentication/authentication.consts';
import { JwtModule } from '@nestjs/jwt';
import { SecurityContextDto, AcsDto } from './dto';
import { SessionDBModule } from '../session/sessiondb.module';
import { SmsModule } from '../sms/sms.module';
import { Test, TestingModule } from '@nestjs/testing';
import { YouthWorkerModule } from '../youthWorker/youthWorker.module';

describe('AuthenticationServiceSecurityContext', () => {
  let module: TestingModule;
  let connection: DataSource;
  let service: AuthenticationService;

  beforeAll(async () => {
    connection = getTestDB();
    module = await Test.createTestingModule({
      imports: [AuthenticationModule, YouthWorkerModule, AppModule, SessionDBModule, JuniorModule, SmsModule, JwtModule.register({
        secret: jwt.secret,
      })],
      providers: [AuthenticationService]
    }).overrideProvider(DataSource)
      .useValue(connection)
      .compile();
    await connection.initialize();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  afterAll(async () => {
    await connection.destroy();
    await module.close();
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
    let generated = null;
    const twoHoursAgo = (new Date().getTime() / 1000) - (3600 * 2);
    const twoHoursLeft = (new Date().getTime() / 1000) + (3600 * 2);
    it('should generate security context', async () => {
      const acsData = { sessionIndex, nameId, firstName, lastName, zipCode } as AcsDto;
      generated = service.generateSecurityContext(acsData);
      signedString = generated.signedString;
      expect(generated.signedString).toBeDefined();
    }),

      it('should validate security context to true ', async () => {
        const scData = {
          sessionIndex,
          nameId,
          firstName,
          lastName,
          zipCode,
          signedString,
          expiryTime: generated.expiryTime
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
