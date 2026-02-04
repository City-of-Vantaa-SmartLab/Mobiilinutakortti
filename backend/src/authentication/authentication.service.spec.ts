import { AppModule } from '../app.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthenticationService } from '../authentication/authentication.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Challenge, Junior } from '../junior/entities';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getTestDB } from '../../test/testdb';
import { JuniorModule } from '../junior/junior.module';
import { JuniorService } from '../junior/junior.service';
import { jwtSecret } from '../authentication/authentication.consts';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../authentication/jwt.strategy';
import { RegisterJuniorDto, LoginJuniorDto } from '../junior/dto';
import { RegisterYouthWorkerDto, LoginYouthWorkerDto } from '../youthWorker/dto';
import { repositoryMockFactory } from '../../test/Mock';
import { SessionDBModule } from '../session/sessionDb.module';
import { SmsModule } from '../sms/sms.module';
import { SpamGuardModule } from '../spamGuard/spamGuard.module';
import { Test, TestingModule } from '@nestjs/testing';
import { YouthWorker, Lockout } from '../youthWorker/entities';
import { YouthWorkerModule } from '../youthWorker/youthWorker.module';
import { YouthWorkerService } from '../youthWorker/youthWorker.service';

describe('AuthenticationService', () => {
  let module: TestingModule;
  let connection: DataSource;
  let service: AuthenticationService;
  let youthWorkerService: YouthWorkerService;
  let juniorService: JuniorService;
  let challengeRepo: Repository<Challenge>;

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
    school: 'Test School',
    class: '5A',
    status: 'accepted',
    photoPermission: true,
  } as RegisterJuniorDto;
  let testLoginJunior: LoginJuniorDto;

  beforeAll(async () => {
    connection = getTestDB();
    module = await Test.createTestingModule({
      imports: [AuthenticationModule, YouthWorkerModule, AppModule, SessionDBModule, JuniorModule, SmsModule, SpamGuardModule, JwtModule.register({
        secret: jwtSecret,
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
    await connection.initialize();

    service = module.get<AuthenticationService>(AuthenticationService);
    youthWorkerService = module.get<YouthWorkerService>(YouthWorkerService);
    juniorService = module.get<JuniorService>(JuniorService);
    challengeRepo = connection.getRepository(Challenge);

    await youthWorkerService.registerYouthWorker(testRegisterYouthWorker);
    await juniorService.registerJunior(testRegisterJunior, undefined, true);

    // Manually create challenge since noSMS=true skips it
    const junior = await juniorService.getJuniorByPhoneNumber(testRegisterJunior.phoneNumber);
    const challenge = challengeRepo.create({
      junior: junior,
      challenge: 'test-challenge-code',
    });
    const savedChallenge = await challengeRepo.save(challenge);
    testLoginJunior = { id: savedChallenge.id, challenge: savedChallenge.challenge };
  });

  afterAll(async () => {
    await connection.destroy();
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Login youth worker', () => {
    it('should return a access token token if login is successful', async () => {
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
      it('An incorrect login should create a lockout entry; however, logging in succesfully should clear it.', async () => {
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

  describe('Login junior', () => {
    it('should return a access token token if login is successful', async () => {
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
