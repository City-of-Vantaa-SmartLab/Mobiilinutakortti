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
import { LogBookDto } from './dto';

describe('ClubService', () => {
  let module: TestingModule;
  let service: ClubService;
  let connection: Connection;
  let juniorService: JuniorService;
  const testJuniors: Junior[] = [];
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

  describe('CheckInJunior', () => {
    it('Should return true when successful', async () => {
      const result = await service.checkInJunior({ juniorId: testJuniors[0].id, clubId: testClub.id });
      expect(result).toBeTruthy();
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

  describe('getCheckinsForClubForDate', () => {
    it('Should return a list of all checkins for the given club on the given date', async () => {
      const testClubDto = { clubId: testClub.id, date: new Date().toISOString() } as LogBookDto;
      const results = await service.getCheckinsForClubForDate(testClubDto);
      expect(results.length > 0);
    });
  });

  describe('generateLogBook', () => {
    beforeAll(async () => {
      await service.checkInJunior({ juniorId: testJuniors[2].id, clubId: testClub.id });
    }),
      it('Should return a "logbook" entry containing the correct totals for ages and genders', async () => {
        const expectedMales = testJuniors.filter(j => j.gender.toLowerCase() === 'm').length;
        const expectedFemales = testJuniors.filter(j => j.gender.toLowerCase() === 'f').length;
        const expectedOther = testJuniors.filter(j => j.gender.toLowerCase() === 'o').length;

        const logbook = await service.generateLogBook({ clubId: testClub.id, date: new Date().toISOString() });
        const ageCheck1 = logbook.ages.some(a => a.value === 2);
        const ageCheck2 = logbook.ages.some(a => a.value === 1);
        const maleCheck = logbook.genders.some(kp => kp.key === 'm' && kp.value === expectedMales);
        const femaleCheck = logbook.genders.some(kp => kp.key === 'f' && kp.value === expectedFemales);
        const otherCheck = logbook.genders.some(kp => kp.key === 'o' && kp.value === expectedOther);
        expect(ageCheck1 && ageCheck2 && maleCheck && femaleCheck && otherCheck).toBeTruthy();
      }),
      it('Should ignore duplicate check-ins for the given date', async () => {
        await service.checkInJunior({ clubId: testClub.id, juniorId: testJuniors[2].id });
        const expectedMales = testJuniors.filter(j => j.gender.toLowerCase() === 'm').length;
        const expectedFemales = testJuniors.filter(j => j.gender.toLowerCase() === 'f').length;
        const expectedOther = testJuniors.filter(j => j.gender.toLowerCase() === 'o').length;
        const logbook = await service.generateLogBook({ clubId: testClub.id, date: new Date().toISOString() });
        const ageCheck1 = logbook.ages.some(a => a.value === 2);
        const ageCheck2 = logbook.ages.some(a => a.value === 1);
        const maleCheck = logbook.genders.some(kp => kp.key === 'm' && kp.value === expectedMales);
        const femaleCheck = logbook.genders.some(kp => kp.key === 'f' && kp.value === expectedFemales);
        const otherCheck = logbook.genders.some(kp => kp.key === 'o' && kp.value === expectedOther);
        expect(ageCheck1 && ageCheck2 && maleCheck && femaleCheck && otherCheck).toBeTruthy();
      });
  });
});
