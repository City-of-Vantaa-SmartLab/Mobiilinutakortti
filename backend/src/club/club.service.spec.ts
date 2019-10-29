import { Test, TestingModule } from '@nestjs/testing';
import { ClubService } from './club.service';
import { Connection } from 'typeorm';
import { getTestDB } from '../../test/testdb';
import { AppModule } from '../app.module';
import { JuniorModule } from '../junior/junior.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../test/Mock';
import { Junior } from '../junior/entities';
import { ClubModule } from './club.module';
import { Club, CheckIn } from './entities';
import { RegisterJuniorDto } from '../junior/dto';
import { JuniorService } from '../junior/junior.service';

describe('ClubService', () => {
  let module: TestingModule;
  let service: ClubService;
  let connection: Connection;
  let juniorService: JuniorService;
  let testJunior: Junior;
  let testClub: Club;

  beforeAll(async () => {
    connection = await getTestDB();
    module = await Test.createTestingModule({
      imports: [AppModule, JuniorModule, ClubModule],
      providers: [ClubService, {
        provide: getRepositoryToken(Club),
        useFactory: repositoryMockFactory,
      }, {
          provide: getRepositoryToken(Junior),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(CheckIn),
          useFactory: repositoryMockFactory,
        }],
    }).overrideProvider(Connection)
      .useValue(connection)
      .compile();

    const testRegisterYouth = {
      phoneNumber: '04122345111',
      firstName: 'Auth jr',
      lastName: 'Senior',
      postCode: '02130',
      parentsName: 'Auth Senior',
      parentsPhoneNumber: '0411234567',
      gender: 'M',
      age: 10,
      homeYouthClub: 'Tikkurila',
    } as RegisterJuniorDto;

    juniorService = module.get<JuniorService>(JuniorService);
    service = module.get<ClubService>(ClubService);
    await juniorService.registerJunior(testRegisterYouth);
    testJunior = await juniorService.getJuniorByPhoneNumber(testRegisterYouth.phoneNumber);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Get clubs', () => {
    it('should return a list of clubs', async () => {
      testClub = (await service.getClubs())[0];
      expect(testClub).toBeDefined();
    });
  });

  describe('CheckInJunior', () => {
    it('Should return true when successful', async () => {
      const result = await service.checkInJunior({ juniorId: testJunior.id, clubId: testClub.id });
      expect(result).toBeTruthy();
    });
  });

  describe('getCheckinsForClub', () => {
    it('Should return a list of all juniors who have checked in at the current club', async () => {
      const testRegisterYouth = {
        phoneNumber: '04122345999',
        firstName: 'Auth jr',
        lastName: 'Senior',
        postCode: '02130',
        parentsName: 'Auth Senior',
        parentsPhoneNumber: '0411234567',
        gender: 'M',
        age: 10,
        homeYouthClub: 'Tikkurila',
      } as RegisterJuniorDto;
      await juniorService.registerJunior(testRegisterYouth);
      const newJunior = await juniorService.getJuniorByPhoneNumber(testRegisterYouth.phoneNumber);
      await service.checkInJunior({ juniorId: newJunior.id, clubId: testClub.id });
      const checkIns = await service.getCheckinsForClub(testClub.id);
      const containsJunior1 = checkIns.some(c => c.junior.id === testJunior.id && c.club.id === testClub.id);
      const containsJunior2 = checkIns.some(c => c.junior.id === newJunior.id && c.club.id === testClub.id);
      expect(containsJunior1 && containsJunior2).toBeTruthy();
    });
  });
});
