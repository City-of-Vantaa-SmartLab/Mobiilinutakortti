import { Test, TestingModule } from '@nestjs/testing';
import { JuniorService } from './junior.service';
import { JuniorModule } from './junior.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../test/Mock';
import { AppModule } from '../app.module';
import { DataSource, Repository } from 'typeorm';
import { getTestDB } from '../../test/testdb';
import { AuthenticationModule } from '../authentication/authentication.module';
import { YouthWorkerModule } from '../youthWorker/youthWorker.module';
import { YouthWorker } from '../youthWorker/entities';
import { ConflictException } from '@nestjs/common';
import { RegisterJuniorDto, LoginJuniorDto, EditJuniorDto } from './dto';
import { Challenge, Junior } from './entities';
import { SmsModule } from '../sms/sms.module';
import { SpamGuardModule } from '../spamGuard/spamGuard.module';

describe('JuniorService', () => {
  let module: TestingModule;
  let service: JuniorService;
  let connection: DataSource;
  let challengeRepo: Repository<Challenge>;

  const testRegisterYouth = {
    phoneNumber: '+3587772345000',
    smsPermissionJunior: false,
    firstName: 'Auth jr',
    lastName: 'Senior',
    postCode: '02130',
    parentsName: 'Auth Senior',
    parentsPhoneNumber: '+358777234567',
    smsPermissionParent: true,
    parentsEmail: undefined,
    emailPermissionParent: false,
    school: 'random school',
    class: '5A',
    gender: 'M',
    birthday: new Date('05-05-2005').toISOString(),
    homeYouthClub: 'Tikkurila',
    status: 'accepted',
    photoPermission: true
  } as RegisterJuniorDto;
  let testLoginYouth: LoginJuniorDto;
  let juniorToEdit: EditJuniorDto;

  beforeAll(async () => {
    connection = getTestDB();
    module = await Test.createTestingModule({
      imports: [AppModule, JuniorModule, YouthWorkerModule, AuthenticationModule, SmsModule, SpamGuardModule ],
      providers: [JuniorService, {
        provide: getRepositoryToken(YouthWorker),
        useFactory: repositoryMockFactory,
      }, {
          provide: getRepositoryToken(Junior),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Challenge),
          useFactory: repositoryMockFactory,
        }],
    }).overrideProvider(DataSource)
      .useValue(connection)
      .compile();
    await connection.initialize();

    service = module.get<JuniorService>(JuniorService);
    challengeRepo = connection.getRepository(Challenge);
  });

  afterAll(async () => {
    await connection.destroy();
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Register Youth', () => {
    beforeAll(async () => {
      await service.registerJunior(testRegisterYouth, undefined, true);
      // Manually create challenge since noSMS=true skips it
      const junior = await service.getJuniorByPhoneNumber(testRegisterYouth.phoneNumber);
      const challenge = challengeRepo.create({
        junior: junior,
        challenge: 'test-challenge-code',
      });
      await challengeRepo.save(challenge);
    }),
      it('should return a value (currently challenge data whilst waiting for further workflow)', async () => {
        const challenge = await service.getChallengeByPhoneNumber(testRegisterYouth.phoneNumber);
        testLoginYouth = {
          id: challenge.id, challenge: challenge.challenge,
        };
        expect(testLoginYouth.challenge).toBeDefined();
      }),
      it('should add the user to the database following a succesful registration', async () => {
        const response = await service.getJuniorByPhoneNumber(testRegisterYouth.phoneNumber);
        expect(response.phoneNumber === testRegisterYouth.phoneNumber &&
          response.firstName === testRegisterYouth.firstName &&
          response.lastName === testRegisterYouth.lastName).toBeTruthy();
      }),
      it('should thrown a Conflict if the phone number already exists', async () => {
        const error = new ConflictException();
        try {
          await service.registerJunior(testRegisterYouth, undefined, true);
          fail();
        } catch (e) {
          expect(e.response === error.getResponse());
        }
      });
  });

  describe('Get All Juniors', () => {
    it('Should return an array containing all juniors', async () => {
      const response = await service.listAllJuniors();
      const isAnArray = Array.isArray(response);
      const containsJuniors = response.data.some(e => e.phoneNumber === testRegisterYouth.phoneNumber);
      expect(isAnArray && containsJuniors).toBeTruthy();
    });
  });

  describe('Edit Junior', () => {
    beforeAll(async () => {
      juniorToEdit = (await service.listAllJuniors())[0];
    }),
      it(' should change values if valid data is provided', async () => {
        const dto = {
          ...juniorToEdit,
          phoneNumber: '04122345600',
        } as EditJuniorDto;
        await service.editJunior(dto, '');
        const updatedJunior = await service.getJuniorByPhoneNumber(dto.phoneNumber);
        const updatedList = await service.listAllJuniors();
        expect(updatedJunior.phoneNumber === dto.phoneNumber
          && (!updatedList.data.some(e => e.phoneNumber === juniorToEdit.phoneNumber))).toBeTruthy();
      });
  });

  describe('Delete Junior', () => {
    let juniorToDelete: string;
    beforeAll(async () => {
      juniorToDelete = (await service.listAllJuniors())[0].id;
    }),
      it('Should delete the user provided', async () => {
        await service.deleteJunior(juniorToDelete);
        const juniorList = await service.listAllJuniors();
        expect(juniorList.data.findIndex(j => j.id === juniorToDelete) < 0);
      });
  });
});
