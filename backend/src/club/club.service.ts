import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckIn, Club } from './entities';
import { Repository } from 'typeorm';
import { Junior } from '../junior/entities';
import { ClubViewModel } from './vm';
import * as content from '../content.json';
import { CheckInDto } from './dto';

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

    async getClubs(): Promise<ClubViewModel[]> {
        return (await this.clubRepo.find()).map(club => new ClubViewModel(club));
    }

    async getCheckinsForClub(clubId: string): Promise<CheckIn[]> {
        const club = await this.clubRepo.findOne(clubId);
        if (!club) { throw new BadRequestException(content.ClubNotFound); }
        return await this.checkInRepo.find({ where: { club }, relations: ['club', 'junior'] });
    }

    async checkInJunior(checkInData: CheckInDto): Promise<boolean> {
        const [junior, club] = await Promise.all([
            this.juniorRepo.findOne(checkInData.juniorId),
            this.clubRepo.findOne(checkInData.clubId)
        ]);
        if (!junior) { throw new BadRequestException(content.UserNotFound); }
        if (!club) { throw new BadRequestException(content.ClubNotFound); }
        const checkIn = { junior, club } as CheckIn;
        await this.checkInRepo.save(checkIn);
        if (!junior.checkIns) { junior.checkIns = []; }
        junior.checkIns.push(checkIn);
        await this.juniorRepo.save(junior);
        return true;
    }
}
