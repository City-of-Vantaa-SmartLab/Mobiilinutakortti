import {
    Injectable,
    ConflictException,
    BadRequestException,
    InternalServerErrorException,
    ForbiddenException,
    Inject,
    forwardRef
} from '@nestjs/common';
import { Junior, Challenge } from './entities';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterJuniorDto, EditJuniorDto } from './dto';
import * as content from '../content.json';
import { JuniorUserViewModel, JuniorListViewModel } from './vm';
import { validate } from 'class-validator';
import { SmsService } from '../sms/sms.service';
// Note, do not delete these imports, they are not currently in use but are used in the commented out code to be used later in prod.
import { ConfigHelper } from '../configHandler';
import { ListControlDto, SortDto, FilterDto } from '../common/dto';
import { ParentFormDto } from '../junior/dto/';
import { AuthenticationService } from '../authentication/authentication.service';
import { validateParentData } from './junior.helper';

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

    async listAllJuniors(controls?: ListControlDto): Promise<JuniorListViewModel> {
        let order = {}, filterValues = {}, query = '', take = 0, skip = 0;
        if (controls) {
            order = controls.sort ? this.applySort(controls.sort) : {};
            ({ query, filterValues } = controls.filters ? this.applyFilters(controls.filters) : { query: '', filterValues: [] });
            take = controls.pagination ? controls.pagination.perPage : 0;
            skip = controls.pagination ? controls.pagination.perPage * (controls.pagination.page - 1) : 0;
        }
        const total = await this.juniorRepo.createQueryBuilder('user')
            .where(query ? query : '1=1', filterValues)
            .getCount()

        const response = (await this.juniorRepo.createQueryBuilder('user')
            .where(query ? query : '1=1', filterValues)
            .orderBy(order)
            .take(take)
            .skip(skip)
            .getMany())
            .map(e => new JuniorUserViewModel(e));
        return new JuniorListViewModel(response, total);
    }

    private applyFilters(filterOptions: FilterDto) {
        const filterValues = {}
        const queryParams = []

        Object.keys(filterOptions).forEach(property => {
            if (property === 'name') {
                queryParams.push(`CONCAT (user.firstName, ' ', user.lastName) ILIKE :${property}`)
                filterValues[property] = `%${filterOptions[property]}%`
            } else if (property === 'parentsPhoneNumber') {
                queryParams.push(`user.parentsPhoneNumber ILIKE :${property}`)
                filterValues[property] = `%${filterOptions[property]}%`
            } else {
                queryParams.push(`user.${property} = :${property}`)
                filterValues[property] = filterOptions[property]
            }
        })
        const query = queryParams.join(' AND ')
        return { query, filterValues }
    }

    private applySort(sortOptions: SortDto) {
        const order = {};
        if (sortOptions.field.toLowerCase() === 'displayname') { sortOptions.field = 'firstName'; }
        if (sortOptions.field) { order[`user.${sortOptions.field}`] = sortOptions.order; }
        return order;
    }

    async getJunior(id: string): Promise<Junior> {
        return await this.juniorRepo.findOne(id);
    }

    async getJuniorByPhoneNumber(phoneNumber: string): Promise<Junior> {
        return await this.juniorRepo.findOne({ phoneNumber });
    }

    async getUniqueJunior(phoneNumber: string, birthday: string, firstName: string, lastName: string): Promise<Junior> {
        return await this.juniorRepo.findOne({ where: { phoneNumber, birthday, firstName, lastName } })
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
        if (this.authenticationService.validateSecurityContext(securityContext) && validateParentData(userData.parentsName, securityContext)) {
            return await this.registerJunior(userData);
        }
        throw new InternalServerErrorException(content.SecurityContextNotValid);
    }

    async registerJunior(registrationData: RegisterJuniorDto, noSMS: boolean = false): Promise<string> {
        const userExists = await this.getUniqueJunior(
            registrationData.phoneNumber,
            registrationData.birthday,
            registrationData.firstName,
            registrationData.lastName
        );

        let junior: Junior
        let renew = false
        if (userExists) {
            if (userExists.status === "expired") {
                // Renew junior for new season
                junior = userExists
                renew = true
            } else {
                // Try to register an old user is not valid
                throw new ConflictException(content.JuniorAlreadyExists);
            }
        } else {
            // Completely new junior creating
            junior = new Junior()
        }

        Object.keys(registrationData).map((key: string) => {
            junior[key] = registrationData[key]
        })
        junior.creationDate = new Date(Date.now()).toISOString()

        const errors = await validate(junior);
        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        await this.createJunior(junior);
        if (junior.status === 'accepted' && !noSMS) {
            const newJunior = await this.getJuniorByPhoneNumber(junior.phoneNumber);
            const challenge = await this.setChallenge(junior.phoneNumber);
            const messageSent = await this.smsService.sendVerificationSMS({ name: newJunior.firstName, phoneNumber: newJunior.phoneNumber }, challenge);
            if (!messageSent) { throw new InternalServerErrorException(content.MessengerServiceNotAvailable); }
        }
        return renew ? `${registrationData.phoneNumber} ${content.Renew}` : `${registrationData.phoneNumber} ${content.Created}`;
    }

    async resetLogin(phoneNumber: string): Promise<string> {
        const junior = await this.juniorRepo.findOne({ phoneNumber });
        if (junior && junior.status === 'accepted') {
            const challenge = await this.setChallenge(phoneNumber);
            const messageSent = await this.smsService.sendVerificationSMS({ name: junior.firstName, phoneNumber: junior.phoneNumber }, challenge);
            if (!messageSent) { throw new InternalServerErrorException(content.MessengerServiceNotAvailable); }
            return `${phoneNumber} ${content.Reset}`;
        }
        else throw new ForbiddenException(content.JuniorAccountNotConfirmedOrFound)
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
        //typeorm doesn't currently return transformed values on save, have to retrieve it again to get the phone number in a correct format
        if ((prevStatus === 'pending' || prevStatus === 'failedCall') && details.status === 'accepted') {
            const updatedJunior = await this.getJuniorByPhoneNumber(user.phoneNumber);
            const challenge = await this.setChallenge(updatedJunior.phoneNumber);
            const messageSent = await this.smsService.sendVerificationSMS({ name: updatedJunior.firstName, phoneNumber: updatedJunior.phoneNumber }, challenge);
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

    async getNextAvailableDummyPhoneNumber(): Promise<string> {
        const juniors = await this.listAllJuniors();
        const phoneNumbers = juniors.data.filter(j => j.phoneNumber.substr(0, 6) === "358999").map(j => j.phoneNumber);
        let next = "";
        for (var i = 0; i < 1000000; i++) {
            next = "358999" + i.toString().padStart(6, '0');
            if (!phoneNumbers.includes(next)) {
                break;
            }
        }
        return next;
    }

    async createNewSeason(): Promise<string> {
        const result: UpdateResult = await this.juniorRepo.createQueryBuilder().update().set({ status: "expired" }).execute()
        return `New season created. ${result.affected} juniors expired`;
    }

    async deleteExpired(): Promise<string> {
        const result: DeleteResult = await this.juniorRepo.delete({ status: 'expired' })
        return `Delete ${result.affected} expired juniors`;
    }

    /**
     * This is a test method, only to be used during testing.
     * @param phoneNumber - juniors phone number
     */
    async getChallengeByPhoneNumber(phoneNumber: string): Promise<Challenge> {
        const user = await this.getJuniorByPhoneNumber(phoneNumber);
        if (!user) { throw new ConflictException(content.UserNotFound); }
        return await this.challengeRepo.findOne({ where: { junior: user }, relations: ['junior'] });
    }

    /**
     * This is a test method, only to be used during testing.
     */
    async createTestDataJuniors(numberOfCases: string): Promise<string> {
        const num = parseInt(numberOfCases);
        const first_names = ['Matti', 'Maija', 'Mervi', 'Olli', 'Riku', 'Maria', 'Juho', 'Aapeli', 'Tauno', 'Liisa', 'Jenni', 'Viola', 'Venla', 'Elias', 'Jenna'];
        const last_names = ['Virtanen', 'Ylinen', 'Koivisto', 'Perälä', 'Niittymäki', 'Hautala', 'Arhinmäki', 'Koski', 'Mäkinen', 'Astola', 'Heikkilä', 'Marjamäki'];
        const school_names = ['Kirkkoharjun ala-aste', 'Tuomiola', 'Mustalampaan koulu', 'Määkiälän ala-aste', 'Pikkola', 'Mordor', 'Tykkimäki', 'Ankkalampi'];
        const class_names = ['1A', '1B', '2C', '3D', '6. luokka', '3. luokka', '1. luokka', '5. luokka'];
        const genders = ['m', 'f', 'o', '-'];
        for (var i = 0; i < num; i++) {
            var date =
                (Math.floor(Math.random() * 8) + 2005).toString() + '-' +
                (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0') + '-' +
                (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0') + 'T00:00:00.000Z';
            var data = {
                phoneNumber: "358777" + i.toString().padStart(6, '0'),
                firstName: first_names[Math.floor(Math.random() * first_names.length)],
                lastName: last_names[Math.floor(Math.random() * last_names.length)],
                postCode: "0" + Math.floor(Math.random() * 1000).toString().padStart(3, '0') + "0",
                school: school_names[Math.floor(Math.random() * school_names.length)],
                class: class_names[Math.floor(Math.random() * class_names.length)],
                parentsName: first_names[Math.floor(Math.random() * first_names.length)] + " " + last_names[Math.floor(Math.random() * last_names.length)],
                parentsPhoneNumber: "358400" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
                gender: genders[Math.floor(Math.random() * genders.length)],
                birthday: date,
                homeYouthClub: (Math.floor(Math.random() * 14) + 1).toString(),
                status: Math.random() < 0.5 ? "accepted" : "pending",
                photoPermission: Math.random() < 0.5 ? true : false
            } as RegisterJuniorDto;
            await this.registerJunior(data, true);
        }
        return `Created ${num.toString()} juniors.`;
    }

    /**
     * This is a test method, only to be used during testing.
     */
    async deleteTestDataJuniors(): Promise<string> {
        const juniors = await this.listAllJuniors();
        const ids = juniors.data.filter(j => j.phoneNumber.substr(0, 6) === "358777").map(j => j.id);
        for (var i = 0; i < ids.length; i++) {
            await this.deleteJunior(ids[i]);
        }
        return `Deleted ${ids.length.toString()} juniors.`;
    }
}
