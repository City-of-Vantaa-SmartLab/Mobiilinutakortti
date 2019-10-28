import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckIn, Club } from './entities';
import { Repository } from 'typeorm';
import { Junior } from '../junior/entities';

@Injectable()
export class ClubService {

    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @InjectRepository(CheckIn)
        private readonly checkInRepo: Repository<CheckIn>,
        @InjectRepository(Club)
        private readonly clubRepo: Repository<Club>,
    ) { }

    async checkInUser(juniorId: string, clubId: string): Promise<boolean> {
        return null;
    }

    async getMostRecentCheckInToday(juniorId: string): Promise<boolean> {
        return null;
    }
}
