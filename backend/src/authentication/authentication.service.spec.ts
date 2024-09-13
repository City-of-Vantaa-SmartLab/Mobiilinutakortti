import { Test, TestingModule } from '@nestjs/testing';
import { YouthWorkerService } from '../youthWorker/youthWorker.service';
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
import { RegisterYouthWorkerDto, LoginYouthWorkerDto } from '../youthWorker/dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JuniorService } from '../junior/junior.service';
import { JuniorModule } from '../junior/junior.module';
import { RegisterJuniorDto, LoginJuniorDto } from '../junior/dto';
import { Challenge, Junior } from '../junior/entities';
import { SmsModule } from '../sms/sms.module';

describe('AuthenticationService', () => {
  let module: TestingModule;
  let connection: DataSource;
  let service: AuthenticationService;
  let youthWorkerService: YouthWorkerService;
  let juniorService: JuniorService;

  const testRegisterYouthWorker = {
    email: 'Authentication@service.test', firstName: 'Auth',
    lastName: 'Tication', password: 'Hush', isAdmin: true,
  } as RegisterYouthWorkerDto;
  const testLoginYouthWorker = {
    email: testRegisterYouthWorker.email, password: testRegisterYouthWorker.password,
  } as LoginYouthWorkerDto;
  const testRegisterJunior = {
    phoneNumber: '04122345618',
    firstName: 'Auth jr',
    lastName: 'Senior',
    postCode: '02130',
    parentsName: 'Auth Senior',
    parentsPhoneNumber: '0411234567',
    gender: 'M',
    birthday: new Date().toISOString(),
    homeYouthClub: 'Tikkurila',
  } as RegisterJuniorDto;
  let testLoginJunior: LoginJuniorDto;

  beforeAll(async () => {
    connection = getTestDB();
    module = await Test.createTestingModule({
      imports: [AuthenticationModule, YouthWorkerModule, AppModule, JuniorModule, SmsModule, JwtModule.register({
        secret: jwt.secret,
      })],
      providers: [YouthWorkerService, AuthenticationService, JuniorService, {
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
    youthWorkerService = module.get<YouthWorkerService>(YouthWorkerService);
    juniorService = module.get<JuniorService>(JuniorService);

    await youthWorkerService.registerYouthWorker(testRegisterYouthWorker);
    await juniorService.registerJunior(testRegisterJunior);
    const juniorChallenge = await juniorService.getChallengeByPhoneNumber(testRegisterJunior.phoneNumber);
    testLoginJunior = { id: juniorChallenge.id, challenge: juniorChallenge.challenge };
  });

  afterAll(async () => {
    await module.close();
    await connection.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Login youth worker', () => {
    it('should return a access token token if login is succseful', async () => {
      expect((await service.loginYouthWorker(testLoginYouthWorker)).access_token).toBeDefined();
    }),
      it('should throw a Bad Request if the user does not exist', async () => {
        const error = new BadRequestException();
        try {
          const testData = { email: 'email@e.mail', password: testLoginYouthWorker.password } as LoginYouthWorkerDto;
          await service.loginYouthWorker(testData);
          fail();
        } catch (e) {
          expect(e.response === error.getResponse());
        }
      }),
      it('should throw a Unauthorized if the password is incorrect', async () => {
        const error = new UnauthorizedException();
        try {
          const testData = { email: testLoginYouthWorker.email, password: 'doubleHush' } as LoginYouthWorkerDto;
          await service.loginYouthWorker(testData);
          fail();
        } catch (e) {
          expect(e.response === error.getResponse());
        }
      }),
      it('An incorrect login should create a lockout entry; however, loging in succesfully should clear it.', async () => {
        const newTestYouthWorker = {
          email: 'Authentication2@service.test', firstName: 'Forgets',
          lastName: 'Alot', password: 'Password', isAdmin: false,
        } as RegisterYouthWorkerDto;
        const loginTestYouthWorker = { email: newTestYouthWorker.email, password: newTestYouthWorker.password } as LoginYouthWorkerDto;
        await youthWorkerService.registerYouthWorker(newTestYouthWorker);
        const id = (await youthWorkerService.getYouthWorkerByEmail(loginTestYouthWorker.email)).id;
        try {
          await service.loginYouthWorker({ email: newTestYouthWorker.email, password: 'DogZ' });
        } catch (e) { }
        const failedAttemptExists = (await youthWorkerService.getLockoutRecord(id));
        await service.loginYouthWorker(loginTestYouthWorker);
        const failedAttemptExists2 = (await youthWorkerService.getLockoutRecord(id));
        expect(failedAttemptExists && !failedAttemptExists2).toBeTruthy();
      }),
      it('Should lock an account after 5 attempts', async () => {
        const newTestYouthWorker = {
          email: 'Authentication3@service.test', firstName: 'Forgets',
          lastName: 'Alot', password: 'Password', isAdmin: false,
        } as RegisterYouthWorkerDto;
        const loginTestYouthWorker = { email: newTestYouthWorker.email, password: newTestYouthWorker.password } as LoginYouthWorkerDto;
        await youthWorkerService.registerYouthWorker(newTestYouthWorker);
        const id = (await youthWorkerService.getYouthWorkerByEmail(loginTestYouthWorker.email)).id;
        let attemptsMatch = true;
        let lockedOut = false;
        for (let i = 1; i < 6; i++) {
          try {
            await service.loginYouthWorker({ email: newTestYouthWorker.email, password: 'Safe' });
          } catch (e) { attemptsMatch = attemptsMatch && ((await youthWorkerService.getLockoutRecord(id)).attempts === i); }
        }
        try {
          await service.loginYouthWorker(loginTestYouthWorker);
        } catch (e) {
          lockedOut = true;
        }
        expect((await youthWorkerService.isLockedOut(id)) && attemptsMatch && lockedOut);
      });
  });

  describe('Login Youth', () => {
    it('should return a access token token if login is succseful', async () => {
      expect((await service.loginJunior(testLoginJunior)).access_token).toBeDefined();
    }),
      it('should throw an error if the challenge provided has alread been used', async () => {
        const error = new UnauthorizedException();
        try {
          await service.loginJunior(testLoginJunior);
          fail();
        } catch (e) {
          expect(e.response === error.getResponse());
        }
      }),
      it('should throw a Bad Request if the user does not exist', async () => {
        const error = new BadRequestException();
        try {
          const testData = { id: `${testLoginJunior.id}estetse`, challenge: testLoginJunior.challenge } as LoginJuniorDto;
          await service.loginJunior(testData);
          fail();
        } catch (e) {
          expect(e.response === error.getResponse());
        }
      });
  });
});
