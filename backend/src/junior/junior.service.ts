import { Injectable, ConflictException, BadRequestException, Inject, InternalServerErrorException } from '@nestjs/common';
import { Junior, Challenge } from './entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterJuniorDto, EditJuniorDto } from './dto';
import { hash } from 'bcrypt';
import { saltRounds } from '../authentication/authentication.consts';
import * as content from '../content.json';
import { JuniorUserViewModel } from './vm/junior.vm';
import { validate } from 'class-validator';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class JuniorService {

    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @InjectRepository(Challenge)
        private readonly challengeRepo: Repository<Challenge>,
        private readonly smsService: SmsService,
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
    async registerJunior(registrationData: RegisterJuniorDto): Promise<string> {
        const userExists = await this.getJuniorByPhoneNumber(registrationData.phoneNumber);
        if (userExists) { throw new ConflictException(content.JuniorAlreadyExists); }
        const junior = {
            firstName: registrationData.firstName, lastName: registrationData.lastName,
            phoneNumber: registrationData.phoneNumber, postCode: registrationData.postCode,
            parentsName: registrationData.parentsName, parentsPhoneNumber: registrationData.parentsPhoneNumber,
            gender: registrationData.gender, age: registrationData.age, homeYouthClub: registrationData.homeYouthClub,
        } as Junior;
        await this.createJunior(junior);
        const challenge = await this.setChallenge(junior.phoneNumber);
        const messageSent = await this.smsService.sendVerificationSMS({ name: junior.firstName, phoneNumber: junior.phoneNumber }, challenge);
        if (!messageSent) { throw new InternalServerErrorException(content.MessengerServiceNotAvailable); }
        return `${registrationData.phoneNumber} ${content.Created}`;
    }

    /**
     * TODO:
     * affected by the same issue as registerJunior.
     */
    async resetLogin(phoneNumber: string): Promise<string> {
        const user = await this.getJuniorByPhoneNumber(phoneNumber);
        if (!user) { throw new ConflictException(content.UserNotFound); }
        const activeChallenge = await this.challengeRepo.findOne({ where: { junior: user }, relations: ['junior'] });
        if (activeChallenge) { await this.challengeRepo.remove(activeChallenge); }
        const challenge = await this.setChallenge(phoneNumber);
        const junior = await this.juniorRepo.findOne({ phoneNumber });
        const messageSent = await this.smsService.sendVerificationSMS({ name: junior.firstName, phoneNumber: junior.phoneNumber }, challenge);
        if (!messageSent) { throw new InternalServerErrorException(content.MessengerServiceNotAvailable); }
        return `${phoneNumber} ${content.Reset}`;
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
        user.age = details.age;
        user.parentsName = details.parentsName;
        user.parentsPhoneNumber = details.parentsPhoneNumber;
        user.postCode = details.postCode;
        user.homeYouthClub = details.homeYouthClub;
        user.gender = details.gender;
        const errors = await validate(user);
        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }
        await this.juniorRepo.save(user);
        return `${details.phoneNumber} ${content.Updated}`;
    }

    // Modified to return challenge, this will be improved upon SMS intergration.
    private async setChallenge(phoneNumber: string): Promise<Challenge> {
        const valueToHash = (Math.floor(1000 + Math.random() * 9000)).toString();
        //const challenge = (encodeURI(await hash(valueToHash, saltRounds))).substr(9, 15);
        const junior = await this.getJuniorByPhoneNumber(phoneNumber);
        const challengeData = { junior, challenge: valueToHash };
        await this.challengeRepo.save(challengeData);
        return await this.challengeRepo.findOne({ junior });
    }
}
