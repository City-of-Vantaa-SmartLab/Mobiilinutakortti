import {
    Injectable,
    ConflictException,
    BadRequestException,
    InternalServerErrorException,
    Inject,
    forwardRef
} from '@nestjs/common';
import { Junior, Challenge } from './entities';
import { Repository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterJuniorDto, EditJuniorDto } from './dto';
import * as content from '../content.json';
import { JuniorUserViewModel } from './vm';
import { validate } from 'class-validator';
import { SmsService } from '../sms/sms.service';
// Note, do not delete these imports, they are not currently in use but are used in the commented out code to be used later in prod.
import { ConfigHelper } from '../configHandler';
import { ListControlDto, SortDto, FilterDto } from '../common/dto';
import { ParentFormDto } from '../junior/dto/';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class JuniorService {

    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @InjectRepository(Challenge)
        private readonly challengeRepo: Repository<Challenge>,
        @Inject(forwardRef(() => AuthenticationService))
        private readonly authenticationService: AuthenticationService,
        private readonly smsService: SmsService,
    ) { }

    async listAllJuniors(controls?: ListControlDto): Promise<JuniorUserViewModel[]> {
        const query = { order: {}, where: {}, skip: 0, take: 0 };
        if (controls) {
            query.order = controls.sort ? this.applySort(controls.sort) : {};
            query.where = controls.filters ? this.applyWhereYouthClub(controls.filters) : {};
            query.take = controls.pagination ? controls.pagination.perPage : 0;
            query.skip = controls.pagination ? controls.pagination.perPage * (controls.pagination.page - 1) : 0;
        }
        const unSearchedResponse = (await this.juniorRepo.find(query)).map(e => new JuniorUserViewModel(e));
        if (controls.filters.name) {
            return unSearchedResponse.filter(junior => junior.firstName.toLowerCase().indexOf(controls.filters.name.toLowerCase()) > -1 ||
                junior.nickName.toLowerCase().indexOf(controls.filters.name.toLowerCase()) > -1 ||
                junior.lastName.toLowerCase().indexOf(controls.filters.name.toLowerCase()) > -1);
        }
        return unSearchedResponse;
    }

    private applySort(sortOptions: SortDto) {
        const order = {};
        if (sortOptions.field.toLowerCase() === 'displayname') { sortOptions.field = 'firstName'; }
        if (sortOptions.field) { order[sortOptions.field] = sortOptions.order; }
        return order;
    }

    private applyWhereYouthClub(filterOptions: FilterDto) {
        const homeYouthClub = 'homeYouthClub';
        const where = [];
        if (filterOptions.homeYouthClub) {
            const query = {};
            query[homeYouthClub] = filterOptions.homeYouthClub;
            where.push(query);
        }
        return where;
    }

    async getTotalJuniors(): Promise<number> {
        return await this.juniorRepo.count();
    }

    async getJunior(id: string): Promise<Junior> {
        return await this.juniorRepo.findOne(id);
    }

    async getJuniorByPhoneNumber(phoneNumber: string): Promise<Junior> {
        return await this.juniorRepo.findOne({ phoneNumber });
    }

    async createJunior(details: Junior) {
        return await this.juniorRepo.save(details);
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

    async registerByParent(formData: ParentFormDto): Promise<string> {
        const { userData, securityContext } = formData;
        if (this.authenticationService.validateSecurityContext(securityContext)) {
            return await this.registerJunior(userData);
        }
        throw new InternalServerErrorException(content.SecurityContextNotValid);
    }

    async registerJunior(registrationData: RegisterJuniorDto): Promise<string> {
        const userExists = await this.getJuniorByPhoneNumber(registrationData.phoneNumber);
        if (userExists) { throw new ConflictException(content.JuniorAlreadyExists); }
        const junior = {
            firstName: registrationData.firstName, lastName: registrationData.lastName,
            phoneNumber: registrationData.phoneNumber, postCode: registrationData.postCode,
            parentsName: registrationData.parentsName, parentsPhoneNumber: registrationData.parentsPhoneNumber,
            school: registrationData.school, class: registrationData.class,
            gender: registrationData.gender, birthday: registrationData.birthday, homeYouthClub: registrationData.homeYouthClub, status: registrationData.status,
            photoPermission: registrationData.photoPermission,
        } as Junior;
        if (registrationData.nickName) { junior.nickName = registrationData.nickName; }
        const errors = await validate(junior);
        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }
        await this.createJunior(junior);
        if (junior.status === 'accepted') {
            const newJunior = await this.getJuniorByPhoneNumber(junior.phoneNumber);
            const challenge = await this.setChallenge(junior.phoneNumber);
            const messageSent = await this.smsService.sendVerificationSMS({ name: newJunior.firstName, phoneNumber: newJunior.phoneNumber }, challenge);
            if (!messageSent) { throw new InternalServerErrorException(content.MessengerServiceNotAvailable); }
        }
        return `${registrationData.phoneNumber} ${content.Created}`;
    }

    async resetLogin(phoneNumber: string): Promise<string> {
        const challenge = await this.setChallenge(phoneNumber);
        const junior = await this.juniorRepo.findOne({ phoneNumber });
        const messageSent = await this.smsService.sendVerificationSMS({ name: junior.firstName, phoneNumber: junior.phoneNumber }, challenge);
        if (!messageSent) { throw new InternalServerErrorException(content.MessengerServiceNotAvailable); }
        return `${phoneNumber} ${content.Reset}`;
    }

    async editJunior(details: EditJuniorDto): Promise<string> {
        const user = await this.juniorRepo.findOne(details.id);
        const prevStatus = user.status;
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        if (user.phoneNumber !== details.phoneNumber) {
            const phoneNumberInUse = await this.getJuniorByPhoneNumber(details.phoneNumber);
            if (phoneNumberInUse) { throw new ConflictException(content.JuniorAlreadyExists); }
        }
        user.phoneNumber = details.phoneNumber;
        user.firstName = details.firstName;
        user.lastName = details.lastName;
        user.birthday = details.birthday;
        user.parentsName = details.parentsName;
        user.parentsPhoneNumber = details.parentsPhoneNumber;
        user.school = details.school;
        user.class = details.class;
        user.postCode = details.postCode;
        user.homeYouthClub = details.homeYouthClub;
        user.gender = details.gender;
        user.nickName = details.nickName;
        user.status = details.status;
        user.photoPermission = details.photoPermission;
        const errors = await validate(user);
        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }
        await this.juniorRepo.save(user);
        if (prevStatus === 'pending' && details.status === 'accepted') {
            const challenge = await this.setChallenge(user.phoneNumber);
            const messageSent = await this.smsService.sendVerificationSMS({ name: user.firstName, phoneNumber: user.phoneNumber }, challenge);
            if (!messageSent) { throw new InternalServerErrorException(content.MessengerServiceNotAvailable); }
        }
        return `${details.phoneNumber} ${content.Updated}`;
    }

    /**
     * This method deletes the provided junior.
     * @param id the id of the user to delete.
     */
    async deleteJunior(id: string) {
        const junior = await this.getJunior(id);
        if (!junior) { throw new BadRequestException(content.UserNotFound); }
        this.juniorRepo.remove(junior);
        return `${id} ${content.Deleted}`;
    }

    // Modified to return challenge, this will be improved upon SMS intergration.
    private async setChallenge(phoneNumber: string): Promise<Challenge> {
        const challenge = (Math.floor(1000 + Math.random() * 90000)).toString();
        const junior = await this.getJuniorByPhoneNumber(phoneNumber);
        const activeChallenge = await this.challengeRepo.findOne({ where: { junior: junior }, relations: ['junior'] });
        if (activeChallenge) { await this.challengeRepo.remove(activeChallenge); }
        const challengeData = { junior, challenge };
        await this.challengeRepo.save(challengeData);
        return await this.challengeRepo.findOne({ junior });
    }

    /**
     * This is a test method, only to be used during testing.
     * @param phoneNumber - juniors phone number
     */
    async getChallengeByPhoneNumber(phoneNumber: string): Promise<Challenge> {
        // TODO: uncomment this line once a method has been provided to allow us to inject a Super Admin to prod.
        // if (ConfigHelper.isLive()) { throw new BadRequestException(content.NonProdFeature); }
        const user = await this.getJuniorByPhoneNumber(phoneNumber);
        if (!user) { throw new ConflictException(content.UserNotFound); }
        return await this.challengeRepo.findOne({ where: { junior: user }, relations: ['junior'] });
    }

}
