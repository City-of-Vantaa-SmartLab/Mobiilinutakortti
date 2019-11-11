import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckIn, Club } from './entities';
import { Repository } from 'typeorm';
import { Junior } from '../junior/entities';
import { ClubViewModel, LogBookViewModel } from './vm';
import * as content from '../content.json';
import { CheckInDto, LogBookDto } from './dto';
import * as ageRanges from './logbookAgeRanges.json';

@Injectable()
export class ClubService {

    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @InjectRepository(CheckIn)
        private readonly checkInRepo: Repository<CheckIn>,
        @InjectRepository(Club)
        private readonly clubRepo: Repository<Club>,
    ) {
        // This if statement allows tests to run correctly.
        try {
            this.clubRepo.count().then(total => {
                if (total < 1) {
                    const testClub = { name: 'Hakunilan Nuorisotila', postCode: '12345' } as Club;
                    this.clubRepo.save(testClub);
                }
            });
            // tslint:disable-next-line: no-empty
        } catch (e) { }
    }

    async getClubById(clubId: string): Promise<Club> {
        return await this.clubRepo.findOne(clubId);
    }

    async getClubs(): Promise<ClubViewModel[]> {
        return (await this.clubRepo.find()).map(club => new ClubViewModel(club));
    }

    async getCheckinsForClub(clubId: string): Promise<CheckIn[]> {
        const club = await this.clubRepo.findOne(clubId);
        if (!club) { throw new BadRequestException(content.ClubNotFound); }
        return await this.checkInRepo.find({ where: { club }, relations: ['club', 'junior'] });
    }

    async getCheckinsForClubForDate(clubId: string, dateTime: string): Promise<CheckIn[]> {
        const startOfDay = new Date(dateTime).setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateTime).setHours(23, 59, 59, 59);
        const clubCheckIns = (await this.getCheckinsForClub(clubId))
            .filter(checkIn => (this.isBetween(new Date(checkIn.timestamp).getTime(), startOfDay, endOfDay)) && checkIn.junior);
        if (clubCheckIns.length <= 0) { throw new BadRequestException(content.NoCheckins); }
        return clubCheckIns;
    }

    async checkInJunior(checkInData: CheckInDto): Promise<boolean> {
        const [junior, club] = await Promise.all([
            this.juniorRepo.findOne(checkInData.juniorId),
            this.clubRepo.findOne(checkInData.clubId),
        ]);
        if (!junior) { throw new BadRequestException(content.UserNotFound); }
        if (!club) { throw new BadRequestException(content.ClubNotFound); }
        const checkIn = { junior, club } as CheckIn;
        await this.checkInRepo.save(checkIn);
        return true;
    }

    async generateLogBook(logbookDetails: LogBookDto): Promise<LogBookViewModel> {
        const checkIns = await this.getCheckinsForClubForDate(logbookDetails.clubId, logbookDetails.date);
        const uniqueJuniors: Junior[] = [];
        checkIns.forEach(checkIn => {
            if (uniqueJuniors.findIndex(junior => junior && junior.id === checkIn.junior.id) < 0) {
                uniqueJuniors.push(checkIn.junior);
            }
        });
        const [genders, ages] = [
            this.getGendersForLogBook(uniqueJuniors.map(j => j.gender)),
            this.getAgesForLogBook(uniqueJuniors.map(j => new Date(j.birthday)))];
        return new LogBookViewModel(checkIns[0].club.name, genders, ages);
    }

    private getGendersForLogBook(allJuniorGenders: string[]): Map<string, number> {
        const genders = new Map();
        genders.set('m', allJuniorGenders.filter(j => j === 'm').length);
        genders.set('f', allJuniorGenders.filter(j => j === 'f').length);
        genders.set('o', allJuniorGenders.filter(j => j === 'o').length);
        return genders;
    }

    private getAgesForLogBook(allJuniorAges: Date[]): Map<string, number> {
        const ages = new Map();
        const allJuniorAgesAsNumbers = allJuniorAges.map(age => this.getAgeFromDate(age));
        ageRanges.ranges.forEach(range => {
            const [min, max] = range.split('-');
            const total = allJuniorAgesAsNumbers.filter(a => this.isBetween(a, +min, +max)).length;
            ages.set(range, total);
        });
        return ages;
    }

    private getAgeFromDate(birthday: Date): number {
        const ageDateTime = new Date(Date.now() - birthday.setHours(0, 0, 0, 0));
        return Math.abs(ageDateTime.getUTCFullYear() - 1970);
    }

    private isBetween(value: number, min: number, max: number): boolean {
        return value <= max && value >= min;
    }
}
