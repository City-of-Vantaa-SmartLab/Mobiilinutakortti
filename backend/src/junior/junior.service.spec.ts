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
import { Admin } from '../admin/admin.entity';
import { ConflictException } from '@nestjs/common';
import { RegisterJuniorDto, LoginJuniorDto } from './dto';
import { EditJuniorDto } from './dto/edit.dto';

describe('JuniorService', () => {
  let module: TestingModule;
  let service: JuniorService;
  let connection: Connection;

  const testRegisterYouth = {
    phoneNumber: '04122345618', firstName: 'Auth jr', lastName: 'Senior',
  } as RegisterJuniorDto;
  let testLoginYouth: LoginJuniorDto;
  let juniorToEdit: EditJuniorDto;

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
        id: testRegisterYouth.phoneNumber, pin: await service.registerJunior(testRegisterYouth),
      };
      expect(testLoginYouth.pin).toBeDefined();
    }),
      it('should add the user to the database following a succesful registration', async () => {
        const response = await service.getJuniorByPhoneNumer(testRegisterYouth.phoneNumber);
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

  describe('Get All Juniors', () => {
    it('Should return an array containing all juniors', async () => {
      const response = await service.listAllJuniors();
      const isAnArray = Array.isArray(response);
      const containsJuniors = response.some(e => e.phoneNumber === testLoginYouth.id);
      expect(isAnArray && containsJuniors).toBeTruthy();
    });
  });

  describe('Edit Junior', () => {
    beforeAll(async () => {
      juniorToEdit = (await service.listAllJuniors())[0];
    }),
      it(' should change values if valid data is provided', async () => {
        const dto = {
          id: juniorToEdit.id, firstName: juniorToEdit.firstName, lastName: juniorToEdit.lastName,
          phoneNumber: '04122345610',
        } as EditJuniorDto;
        await service.editJunior(dto);
        const updatedJunior = await service.getJuniorByPhoneNumer(dto.phoneNumber);
        const updatedList = await service.listAllJuniors();
        expect(updatedJunior.phoneNumber === dto.phoneNumber
          && (!updatedList.some(e => e.phoneNumber === juniorToEdit.phoneNumber.toLowerCase()))).toBeTruthy();
      });
  });
});
