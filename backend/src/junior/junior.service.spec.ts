import { Test, TestingModule } from '@nestjs/testing';
import { JuniorService } from './junior.service';
import { JuniorModule } from './junior.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../test/Mock';
import { AppModule } from '../app.module';
import { Connection } from 'typeorm';
import { getTestDB } from '../../test/testdb';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AdminModule } from '../admin/admin.module';
import { Admin } from '../admin/admin.entity';
import { ConflictException, HttpModule } from '@nestjs/common';
import { RegisterJuniorDto, LoginJuniorDto, EditJuniorDto } from './dto';
import { Challenge, Junior } from './entities';
import { SmsModule } from '../sms/sms.module';

describe('JuniorService', () => {
  let module: TestingModule;
  let service: JuniorService;
  let connection: Connection;

  const testRegisterYouth = {
    phoneNumber: '04122345618',
    firstName: 'Auth jr',
    lastName: 'Senior',
    postCode: '02130',
    parentsName: 'Auth Senior',
    parentsPhoneNumber: '0411234567',
    gender: 'M',
    age: 10,
    homeYouthClub: 'Tikkurila',
  } as RegisterJuniorDto;
  let testLoginYouth: LoginJuniorDto;
  let juniorToEdit: EditJuniorDto;

  const phoneNumberTransformer = (str: string) => str.charAt(0) === '0' ? str.replace('0', '358') : str;

  beforeAll(async () => {
    connection = await getTestDB();
    module = await Test.createTestingModule({
      imports: [AppModule, JuniorModule, AdminModule, AuthenticationModule, SmsModule, HttpModule],
      providers: [JuniorService, {
        provide: getRepositoryToken(Admin),
        useFactory: repositoryMockFactory,
      }, {
          provide: getRepositoryToken(Junior),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Challenge),
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
    it('should return a value (currently challenge data whilst waiting for further workflow)', async () => {
      await service.registerJunior(testRegisterYouth);
      const challenge = await service.getChallengeByPhoneNumber(testRegisterYouth.phoneNumber);
      testLoginYouth = {
        id: challenge.id, challenge: challenge.challenge,
      };
      expect(testLoginYouth.challenge).toBeDefined();
    }),
      it('should add the user to the database following a succesful registration', async () => {
        const response = await service.getJuniorByPhoneNumber(testRegisterYouth.phoneNumber);
        expect(response.phoneNumber === phoneNumberTransformer(testRegisterYouth.phoneNumber.toLowerCase()) &&
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

  describe('Get All Juniors', () => {
    it('Should return an array containing all juniors', async () => {
      const response = await service.listAllJuniors();
      const isAnArray = Array.isArray(response);
      const containsJuniors = response.some(e => e.phoneNumber === phoneNumberTransformer(testRegisterYouth.phoneNumber));
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
          phoneNumber: '04122345610',
        } as EditJuniorDto;
        await service.editJunior(dto);
        const updatedJunior = await service.getJuniorByPhoneNumber(dto.phoneNumber);
        const updatedList = await service.listAllJuniors();
        expect(updatedJunior.phoneNumber === phoneNumberTransformer(dto.phoneNumber)
          && (!updatedList.some(e => e.phoneNumber === phoneNumberTransformer(juniorToEdit.phoneNumber.toLowerCase())))).toBeTruthy();
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
        expect(juniorList.findIndex(j => j.id === juniorToDelete) < 0);
      });
  });
});
