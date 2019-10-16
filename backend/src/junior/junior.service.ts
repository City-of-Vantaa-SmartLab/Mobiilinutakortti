import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Junior, Challenge } from './entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterJuniorDto, EditJuniorDto } from './dto';
import { hash } from 'bcrypt';
import { saltRounds } from '../authentication/authentication.consts';
import * as content from '../content.json';
import { JuniorUserViewModel } from './vm/junior.vm';

@Injectable()
export class JuniorService {

    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @InjectRepository(Challenge)
        private readonly challengeRepo: Repository<Challenge>,
    ) { }

    async listAllJuniors(): Promise<JuniorUserViewModel[]> {
        return (await this.juniorRepo.find()).map(e => new JuniorUserViewModel(e));
    }

    async getJunior(id: string): Promise<Junior> {
        return await this.juniorRepo.findOne(id);
    }

    async getJuniorByPhoneNumber(phoneNumber: string): Promise<Junior> {
        return await this.juniorRepo.findOne({ phoneNumber });
    }

    async createJunior(details: Junior) {
        await this.juniorRepo.save(details);
    }

    async attemptChallenge(challengeId: string, challenge: string): Promise<string> {
        const entry = await this.challengeRepo.findOne({ where: { id: challengeId }, relations: ['junior'] });
        // Returning false could be more benefical than providing an exception in terms of security.
        if (!entry) { return undefined; }
        if (challenge !== entry.challenge) { return undefined; }
        const user = entry.junior;
        if (!user) { return undefined; }
        await this.challengeRepo.remove(entry);
        return user.id;
    }

    /**
     * TODO:
     * Currently this returns the challenge as we need pass that back to frontend.
     * Will be corrected when relevant workflow is introduced.
     */
    async registerJunior(registrationData: RegisterJuniorDto): Promise<Challenge> {
        const userExists = await this.getJuniorByPhoneNumber(registrationData.phoneNumber);
        if (userExists) { throw new ConflictException(content.JuniorAlreadyExists); }
        const junior = {
            firstName: registrationData.firstName, lastName: registrationData.lastName,
            phoneNumber: registrationData.phoneNumber,
        } as Junior;
        await this.createJunior(junior);
        // return `${registrationData.phoneNumber} ${content.Created} (PIN:${pin})`;
        return await this.setChallenge(junior.phoneNumber);
    }

    /**
     * TODO:
     * affected by the same issue as registerJunior.
     */
    async resetLogin(phoneNumber: string): Promise<Challenge> {
        const user = await this.getJuniorByPhoneNumber(phoneNumber);
        if (!user) { throw new ConflictException(content.UserNotFound); }
        const activeChallenge = await this.challengeRepo.findOne({ where: { junior: user }, relations: ['junior'] });
        if (activeChallenge) { this.challengeRepo.remove(activeChallenge); }
        return await this.setChallenge(phoneNumber);
    }

    async editJunior(details: EditJuniorDto): Promise<string> {
        const user = await this.juniorRepo.findOne(details.id);
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        if (user.phoneNumber !== details.phoneNumber) {
            const phoneNumberInUse = await this.getJuniorByPhoneNumber(details.phoneNumber);
            if (phoneNumberInUse) { throw new ConflictException(content.JuniorAlreadyExists); }
        }
        user.phoneNumber = details.phoneNumber;
        user.firstName = details.firstName;
        user.lastName = details.lastName;
        await this.juniorRepo.save(user);
        return `${details.phoneNumber} ${content.Updated}`;
    }

    // Modified to return challenge, this will be improved upon SMS intergration.
    private async setChallenge(phoneNumber: string): Promise<Challenge> {
        const valueToHash = (Math.floor(1000 + Math.random() * 9000)).toString();
        const challenge = encodeURI(await hash(valueToHash, saltRounds));
        const junior = await this.getJuniorByPhoneNumber(phoneNumber);
        const challengeData = { junior, challenge };
        await this.challengeRepo.save(challengeData);
        return await this.challengeRepo.findOne({ junior });
    }
}
