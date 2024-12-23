import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckIn, Club } from './entities';
import { LessThan, Repository } from 'typeorm';
import { Junior } from '../junior/entities';
import { ClubViewModel, CheckInStatsViewModel } from './vm';
import * as content from '../content';
import { CheckInDto, CheckInStatsSettingsDto } from './dto';
import { Cron } from '@nestjs/schedule';
import { differenceInHours, sub } from 'date-fns';
import { EditClubDto } from './dto/edit.dto';
import { KompassiService } from '../kompassi/kompassi.service';
import { statisticsAgeGroups } from '../common/statisticsAgeGroups';
import { calculateAge, isBetween } from '../common/helpers';
import { Gender } from '../common/genderMapping';

@Injectable()
export class ClubService {

    private readonly logger = new Logger('Club Service');

    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @InjectRepository(CheckIn)
        private readonly checkInRepo: Repository<CheckIn>,
        @InjectRepository(Club)
        private readonly clubRepo: Repository<Club>,
        private readonly kompassiService: KompassiService
    ) {}

    async getClubById(clubId: number): Promise<Club> {
        return (await this.clubRepo.createQueryBuilder('club')
            .leftJoinAndSelect('club.kompassiIntegration', 'kompassiIntegration')
            .where({ id: clubId })
            .getOne());
    }

    async getClubs(): Promise<ClubViewModel[]> {
        return (await this.clubRepo.createQueryBuilder('club')
            .leftJoinAndSelect('club.kompassiIntegration', 'kompassiIntegration')
            .getMany())
            .map(club => new ClubViewModel(club));
    }

    async checkIfAlreadyCheckedIn(juniorId: string, clubId: number): Promise<boolean> {
        const now = new Date();
        const checkIns = await this.getCheckinsForClub(clubId);
        return checkIns.some((checkIn) =>
            checkIn.junior.id === juniorId && differenceInHours(now, checkIn.checkInTime) < 2
        );
    }

    async getCheckinsForClub(clubId: number): Promise<CheckIn[]> {
        const club = await this.clubRepo.findOneBy({ id: clubId });
        if (!club) { throw new BadRequestException(content.ClubNotFound); }
        return await this.checkInRepo.find({ where: { club }, relations: ['club', 'junior'] });
    }

    // Get checkins for a time period by providing the time period in unix timestamp, otherwise checkins are returned for the selected day
    async getCheckins(settings: CheckInStatsSettingsDto, timePeriod?: number): Promise<CheckIn[]> {
        const startOfTimePeriod = timePeriod ? new Date(settings.date).setHours(0, 0, 0, 0) - timePeriod : new Date(settings.date).setHours(0, 0, 0, 0);
        const endOfTimePeriod = new Date(settings.date).setHours(23, 59, 59, 59);
        const clubCheckIns = (await this.getCheckinsForClub(settings.clubId))
            .filter(checkIn => (isBetween(new Date(checkIn.checkInTime).getTime(), startOfTimePeriod, endOfTimePeriod)) && checkIn.junior);
        return clubCheckIns;
    }

    async checkInJunior(checkInData: CheckInDto): Promise<boolean> {
        const [junior, club] = await Promise.all([
            this.juniorRepo.findOneBy({ id: checkInData.juniorId }),
            this.clubRepo.createQueryBuilder('club')
                .leftJoinAndSelect('club.kompassiIntegration', 'kompassiIntegration')
                .where({ id: checkInData.clubId })
                .getOne()
        ]);
        if (!junior) { throw new BadRequestException(content.UserNotFound); }
        if (!club) { throw new BadRequestException(content.ClubNotFound); }

        await this.checkInRepo.save({ junior, club, checkInTime: new Date() });

        // Intentionally not awaited.
        this.kompassiService.updateKompassiData(junior, club);

        return true;
    }

    async editClub(data: EditClubDto): Promise<string> {
        const club = await this.clubRepo.findOneBy({ id: data.id });
        if (!club) { throw new BadRequestException(content.ClubNotFound); };
        club.id = data.id;
        club.name = data.name;
        club.postCode = data.postCode;
        club.active = data.active;
        club.messages = data.messages;
        club.kompassiIntegration = data.kompassiIntegration;

        await this.clubRepo.save(club);
        return `${data.id} ${content.Updated}`;
    }

    async generateStats(settings: CheckInStatsSettingsDto): Promise<CheckInStatsViewModel> {
        const checkIns = await this.getCheckins(settings);
        const uniqueJuniors: Junior[] = [];
        checkIns.forEach(checkIn => {
            if (uniqueJuniors.findIndex(junior => junior && junior.id === checkIn.junior.id) < 0) {
                uniqueJuniors.push(checkIn.junior);
            }
        });

        const byGender = {
            [Gender.Female]: [],
            [Gender.Male]: [],
            [Gender.Undisclosed]: [],
            [Gender.Other]: [],
        };
        uniqueJuniors.forEach(junior => {
            const { gender } = junior;
            byGender[gender].push(junior);
        });
        const byGenderAndAge = Object.entries(byGender).reduce((result, [gender, juniors]) => ({
            ...result,
            [gender]: this.getAgesForStatistics(juniors),
        }), {});

        const clubName = (await this.getClubById(settings.clubId)).name;
        return new CheckInStatsViewModel(clubName, byGenderAndAge);
    }

    private getAgesForStatistics(juniors: Junior[]): Map<string, number> {
        const ages = new Map();
        const juniorAges = juniors.map(j => calculateAge(j.birthday));
        statisticsAgeGroups.forEach(ageGroup => {
            const [min, max] = ageGroup.range.split('-');
            const total = juniorAges.filter(a => isBetween(a, +min, +max)).length;
            ages.set(ageGroup.range, total);
        });
        return ages;
    }

    // Delete checkins older than 14 days every night at 4 AM
    @Cron('0 4 * * *')
    async deleteOldCheckins(): Promise<void> {
        const cutoff = sub(new Date(), { days: 14 });
        const result = await this.checkInRepo.delete({ checkInTime: LessThan(cutoff) });
        this.logger.log(`Deleted ${result.affected} checkins that happened before ${cutoff.toISOString()}`);
    }

}
