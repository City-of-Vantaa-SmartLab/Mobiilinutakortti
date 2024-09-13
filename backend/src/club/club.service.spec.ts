import { Test, TestingModule } from '@nestjs/testing';
import { ClubService } from './club.service';
import { DataSource } from 'typeorm';
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
import { LogBookDto } from './dto';

describe('ClubService', () => {
  let module: TestingModule;
  let service: ClubService;
  let connection: DataSource;
  let juniorService: JuniorService;
  const testJuniors: Junior[] = [];
  let testClub: Club;

  beforeAll(async () => {
    connection = getTestDB();
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
    }).overrideProvider(DataSource)
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
      birthday: new Date('05-05-2012').toISOString(),
      homeYouthClub: 'Tikkurila',
    } as RegisterJuniorDto;

    const testRegisterYouth2 = {
      phoneNumber: '04122345999',
      firstName: 'Auth jr',
      lastName: 'Senior',
      postCode: '02130',
      parentsName: 'Auth Senior',
      parentsPhoneNumber: '0411234567',
      gender: 'M',
      birthday: new Date('05-05-2005').toISOString(),
      homeYouthClub: 'Tikkurila',
    } as RegisterJuniorDto;

    const testRegisterYouth3 = {
      phoneNumber: '04122345998',
      firstName: 'Auth jr',
      lastName: 'Senior',
      postCode: '02130',
      parentsName: 'Auth Senior',
      parentsPhoneNumber: '0411234567',
      gender: 'F',
      birthday: new Date('05-05-2005').toISOString(),
      homeYouthClub: 'Tikkurila',
    } as RegisterJuniorDto;

    juniorService = module.get<JuniorService>(JuniorService);
    service = module.get<ClubService>(ClubService);
    await juniorService.registerJunior(testRegisterYouth);
    await juniorService.registerJunior(testRegisterYouth2);
    await juniorService.registerJunior(testRegisterYouth3);
    testJuniors.push(await juniorService.getJuniorByPhoneNumber(testRegisterYouth.phoneNumber));
    testJuniors.push(await juniorService.getJuniorByPhoneNumber(testRegisterYouth2.phoneNumber));
    testJuniors.push(await juniorService.getJuniorByPhoneNumber(testRegisterYouth3.phoneNumber));
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

  // If you change junior used in this test, do same to test below, they are chained
  describe('CheckInJunior', () => {
    it('Should return true when successful', async () => {
      const result = await service.checkInJunior({ juniorId: testJuniors[0].id, clubId: testClub.id });
      expect(result).toBeTruthy();
    });
  });

  describe('CheckInJuniorDuplicate', () => {
    it('Should return true when trying to check same junior again', async () => {
      const result = await service.checkIfAlreadyCheckedIn(testJuniors[0].id, testClub.id);
      expect(result).toBeTruthy();
    });
  });

  describe('CheckInJuniorDuplicate', () => {
    it('Should return false when trying to check new junior', async () => {
      const result = await service.checkIfAlreadyCheckedIn(testJuniors[1].id, testClub.id);
      expect(result).toBeFalsy();
    });
  });

  describe('getCheckinsForClub', () => {
    it('Should return a list of all juniors who have checked in at the current club', async () => {
      await service.checkInJunior({ juniorId: testJuniors[1].id, clubId: testClub.id });
      const checkIns = await service.getCheckinsForClub(testClub.id);
      const containsJunior1 = checkIns.some(c => c.junior.id === testJuniors[0].id && c.club.id === testClub.id);
      const containsJunior2 = checkIns.some(c => c.junior.id === testJuniors[1].id && c.club.id === testClub.id);
      expect(containsJunior1 && containsJunior2).toBeTruthy();
    });
  });

  describe('getCheckins', () => {
    it('Should return a list of all checkins for the given club on the given date', async () => {
      const testClubDto = { clubId: testClub.id, date: new Date().toISOString() } as LogBookDto;
      const results = await service.getCheckins(testClubDto);
      expect(results.length > 0);
    });
  });

});
