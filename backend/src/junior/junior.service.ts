import {
    Injectable,
    ConflictException,
    BadRequestException,
    InternalServerErrorException,
    ForbiddenException,
    Inject,
    forwardRef,
    Logger
} from '@nestjs/common';
import { YouthWorker } from '../youthWorker/entities';
import { Junior, Challenge } from './entities';
import { DeleteResult, QueryFailedError, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterJuniorDto, EditJuniorDto, SeasonExpiredDto } from './dto';
import * as content from '../content';
import { JuniorUserViewModel, JuniorListViewModel } from './vm';
import { validate } from 'class-validator';
import { SmsService } from '../sms/sms.service';
import { ListControlDto, SortDto, FilterDto } from '../common/dto';
import { ParentFormDto } from '../junior/dto/';
import { AuthenticationService } from '../authentication/authentication.service';
import { validateParentData } from './junior.helper';
import { obfuscate } from 'src/utils/helpers';
import { ConfigHelper } from '../configHandler';
import { Status } from './enum/status.enum';

@Injectable()
export class JuniorService {
    private readonly logger = new Logger('Junior Service');

    constructor(
        @InjectRepository(YouthWorker)
        private readonly youthWorkerRepo: Repository<YouthWorker>,
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @InjectRepository(Challenge)
        private readonly challengeRepo: Repository<Challenge>,
        @Inject(forwardRef(() => AuthenticationService))
        private readonly authenticationService: AuthenticationService,
        private readonly smsService: SmsService,
    ) { }

    async listAllJuniors(controls?: ListControlDto, userId?: string): Promise<JuniorListViewModel> {
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

        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId, juniorIds: response.map(junior => junior.id) }, `User fetched juniors.`);
        }
        return new JuniorListViewModel(response, total);
    }

    private applyFilters(filterOptions: FilterDto) {
        const filterValues = {}
        const queryParams = []

        Object.keys(filterOptions).forEach(property => {
            if (property === 'name') {
                queryParams.push(`CONCAT (user.firstName, ' ', user.lastName) ILIKE :${property}`)
                filterValues[property] = `%${filterOptions[property]}%`
            } else if (property === 'phoneNumber') {
                queryParams.push(`user.phoneNumber ILIKE :${property}`)
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

    async getJunior(id: string, userId?: string): Promise<Junior> {
        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId, juniorId: id }, `User fetched junior.`);
        }

        return await this.juniorRepo.findOneBy({ id });
    }

    async getJuniorByPhoneNumber(phoneNumber: string): Promise<Junior> {
        return await this.juniorRepo.findOneBy({ phoneNumber });
    }

    async getJuniorsByHomeYouthClub(homeYouthClub: string): Promise<Junior[]> {
        return await this.juniorRepo.findBy({ homeYouthClub });
    }

    async getUniqueJunior(phoneNumber: string, birthday?: string, firstName?: string, lastName?: string): Promise<Junior> {
        if (!birthday) return await this.juniorRepo.findOne({ where: { phoneNumber, firstName, lastName } });
        if (!firstName || !lastName ) return await this.juniorRepo.findOne({ where: { phoneNumber, birthday } });
        return await this.juniorRepo.findOne({ where: { phoneNumber, birthday, firstName, lastName } });
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

    // When a new season is started, all registered juniors are marked as expired. If a junior registration is not yet finished by a youth worker, the status will be pending. In both cases a parent might re-register the junior.
    // However, production use has shown that sometimes parents mistype the junior's birthday or name. In this case when they try to re-register the junior, they only get an error and try again. And again. And again, especially if the error occurred the previous year and this time around all the information is correct. Eventually they complain to the youth club youth workers, and sometimes this results in a contact to maintenance, i.e. developers.
    // Therefore it was decided that when registering a junior, it would be enough to have a matching phonenumber + either the birthday or name, so not all three are required to match for the existing junior to be considered a match.
    async registerJunior(registrationData: RegisterJuniorDto, userId?: string, noSMS: boolean = false): Promise<string> {
        this.logger.log(`Registering junior ${obfuscate(registrationData.firstName + ' ' + registrationData.lastName)} ${registrationData.phoneNumber} ${registrationData.birthday.slice(0, 4)}-xx-xx`);

        let existingJunior = await this.getUniqueJunior(
            registrationData.phoneNumber,
            registrationData.birthday,
            registrationData.firstName,
            registrationData.lastName
        );
        if (existingJunior) {
            this.logger.log(`Found existing junior (perfect match: phonenumber, birthday, name): ID ${existingJunior.id}, status ${existingJunior.status}`)
        } else {
            existingJunior = await this.getUniqueJunior(registrationData.phoneNumber, registrationData.birthday);
            if (existingJunior) {
                this.logger.log(`Found existing junior (partial match: phonenumber, birthday): ID ${existingJunior.id}, status ${existingJunior.status}`)
            } else {
                existingJunior = await this.getUniqueJunior(
                    registrationData.phoneNumber, null,
                    registrationData.firstName, registrationData.lastName
                );
                if (existingJunior) {
                    this.logger.log(`Found existing junior (partial match: phonenumber, name): ID ${existingJunior.id}, status ${existingJunior.status}`)
                }
            }
        }

        let junior: Junior;
        let renew = false;
        if (existingJunior) {
            // Youth workers should edit existing juniors via the edit endpoint. Ending up here means they are accidentally trying to create a new junior with matching information of an existing junior. The existing junior would be overwritten, which is probably not what is wanted.
            if (userId) {
                this.logger.log(`Youth worker ${userId} tried to overwrite existing junior ${existingJunior.id}.`);
                throw new ConflictException(content.JuniorAlreadyExists);
            }

            // Only allow account renewal if existing junior's status is expired or pending.
            if ([Status.expired, Status.pending].includes(existingJunior.status as Status)) {
                this.logger.log(`Overwriting junior ${existingJunior.phoneNumber}`);
                junior = existingJunior;
                renew = true;
            } else {
                this.logger.error(`Unable to overwrite existing junior ${existingJunior.phoneNumber}, because status is not expired or pending.`);
                throw new ConflictException(content.JuniorNotExpiredOrPending);
            }
        } else {
            if (userId && ConfigHelper.detailedLogs()) {
                this.logger.log({ userId: userId }, `User creates new junior.`);
            }
            this.logger.log('Existing junior not found, creating new.');
            junior = new Junior();
        }

        Object.keys(registrationData).map((key: string) => { junior[key] = registrationData[key] });
        // Make sure hidden fields have some data in them.
        content.hiddenJuniorFields.forEach((key) => { junior[key] = junior[key] ?? '' });
        // Junior communicationsLanguage might be a hidden field but it is still required.
        if (!junior.communicationsLanguage) junior.communicationsLanguage = 'fi';
        junior.creationDate = new Date(Date.now()).toISOString()

        const errors = await validate(junior);
        if (errors.length > 0) {
            this.logger.error(`Validation error: ${errors}`);
            throw new BadRequestException(errors);
        }

        try {
            this.logger.log(`Saving junior ${junior.phoneNumber}`);
            // Creates new or updates an existing junior.
            await this.juniorRepo.save(junior);
        } catch (e) {
            this.logger.error(`Error saving junior ${junior.phoneNumber}: ${e.name}: ${e.message}`);
            if (e instanceof QueryFailedError) {
                throw new ConflictException(content.JuniorAlreadyExists);
            }
            throw e;
        }

        if (junior.status === Status.accepted && !noSMS) {
            const newJunior = await this.getJuniorByPhoneNumber(junior.phoneNumber);
            const challenge = await this.setChallenge(junior.phoneNumber);
            const messageSent = await this.smsService.sendVerificationSMS({
                lang: newJunior.communicationsLanguage as content.Language,
                name: newJunior.firstName,
                phoneNumber: newJunior.phoneNumber,
                homeYouthClub: newJunior.homeYouthClub,
            }, challenge);
            if (!messageSent) { throw new InternalServerErrorException(content.SmsServiceNotAvailable); }
        }

        this.logger.log(`Saved junior ${junior.id}`);
        return renew ? content.Renew(registrationData.phoneNumber) : content.Created(registrationData.phoneNumber);
    }

    async resetLogin(phoneNumber: string): Promise<string> {
        const junior = await this.juniorRepo.findOneBy({ phoneNumber });
        if (junior && (junior.status === Status.accepted || junior.status === Status.expired)) {
            const challenge = await this.setChallenge(phoneNumber);
            const messageSent = await this.smsService.sendVerificationSMS({
                lang: junior.communicationsLanguage as content.Language,
                name: junior.firstName,
                phoneNumber: junior.phoneNumber,
                homeYouthClub: junior.homeYouthClub,
            }, challenge);
            if (!messageSent) { throw new InternalServerErrorException(content.SmsServiceNotAvailable); }
            return `${phoneNumber} ${content.Reset}`;
        }
        else throw new ForbiddenException(content.JuniorAccountNotConfirmedOrFound)
    }

    async editJunior(details: EditJuniorDto, youthWorkerUserId: string): Promise<string> {
        const user = await this.juniorRepo.findOneBy({ id: details.id });
        const prevStatus = user.status;
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        if (user.phoneNumber !== details.phoneNumber) {
            const phoneNumberInUse = await this.getJuniorByPhoneNumber(details.phoneNumber);
            if (phoneNumberInUse) { throw new ConflictException(content.JuniorAlreadyExists); }
        }
        user.phoneNumber = details.phoneNumber;
        user.smsPermissionJunior = details.smsPermissionJunior;
        user.firstName = details.firstName;
        user.lastName = details.lastName;
        user.birthday = details.birthday;
        user.parentsName = details.parentsName;
        user.parentsPhoneNumber = details.parentsPhoneNumber;
        user.smsPermissionParent = details.smsPermissionParent;
        user.parentsEmail = details.parentsEmail;
        user.emailPermissionParent = details.emailPermissionParent;
        user.additionalContactInformation = details.additionalContactInformation;
        user.school = details.school;
        user.class = details.class;
        user.postCode = details.postCode;
        user.homeYouthClub = details.homeYouthClub;
        user.communicationsLanguage = details.communicationsLanguage;
        user.gender = details.gender;
        user.nickName = details.nickName;
        user.status = details.status;
        user.photoPermission = details.photoPermission;
        const errors = await validate(user);
        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }
        // Only admins (not regular youth workers) can manually update status from expired state.
        if (prevStatus === Status.expired && details.status !== prevStatus) {
            const youthWorker = await this.youthWorkerRepo.findOneBy({ id: youthWorkerUserId });
            if (!youthWorker?.isAdmin) {
                // ForbiddenRequestException would be semantically more appropriate, but it would result in
                // automatic logout in the frontend.
                throw new BadRequestException(content.ForbiddenToChangeExpiredStatus)
            }
        }
        await this.juniorRepo.save(user);

        if (ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: youthWorkerUserId, juniorId: details.id }, `User modified junior.`);
        }
        //typeorm doesn't currently return transformed values on save, have to retrieve it again to get the phone number in a correct format
        if ((prevStatus === Status.expired || prevStatus === Status.pending || prevStatus === Status.failedCall) && details.status === Status.accepted) {
            const updatedJunior = await this.getJuniorByPhoneNumber(user.phoneNumber);
            const challenge = await this.setChallenge(updatedJunior.phoneNumber);
            const messageSent = await this.smsService.sendVerificationSMS({
                lang: updatedJunior.communicationsLanguage as content.Language,
                name: updatedJunior.firstName,
                phoneNumber: updatedJunior.phoneNumber,
                homeYouthClub: updatedJunior.homeYouthClub,
            }, challenge);
            if (!messageSent) { throw new InternalServerErrorException(content.SmsServiceNotAvailable); }
        }
        return `${details.phoneNumber} ${content.Updated}`;
    }

    /**
     * This method deletes the provided junior.
     * @param id the id of the user to delete.
     */
    async deleteJunior(id: string, userId?: string) {
        const junior = await this.getJunior(id);
        if (!junior) { throw new BadRequestException(content.UserNotFound); }
        this.juniorRepo.remove(junior);
        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId, juniorId: id }, `User deleted junior.`);
        }
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
        return await this.challengeRepo.findOneBy({ junior });
    }

    async getNextAvailableDummyPhoneNumber(): Promise<string> {
        const juniors = await this.listAllJuniors();
        const phoneNumbers = juniors.data.filter(j => j.phoneNumber.substring(0, 6) === "358999").map(j => j.phoneNumber);
        let next = "";
        for (var i = 0; i < 1000000; i++) {
            next = "358999" + i.toString().padStart(6, '0');
            if (!phoneNumbers.includes(next)) {
                break;
            }
        }
        return next;
    }

    async createNewSeason({ expireDate }: SeasonExpiredDto, userId?: string): Promise<string> {
        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId }, `User created new season.`);
        }

        const result: UpdateResult = await this.juniorRepo.createQueryBuilder().update().set({ status: Status.accepted }).execute()
        const juniors = await this.juniorRepo.find();

        // This SMS is sent to the parents. We don't know the parent's preferred communications language, so we must use the junior's language.
        // NB: the SMS is sent to each parent regardless if they have agreed on receiving announcement SMSs or not. This case is mentioned in the end user agreement.
        const recipients = juniors.map(junior => ({
            lang: junior.communicationsLanguage as content.Language,
            name: `${junior.firstName} ${junior.lastName}`,
            phoneNumber: junior.parentsPhoneNumber,
        }));

        await this.smsService.sendNewSeasonSMS(recipients, expireDate);

        return content.NewSeasonCreated(result.affected);
    }

    async deleteExpired(userId?: string): Promise<string> {
        const result: DeleteResult = await this.juniorRepo.delete({ status: Status.expired })
        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId }, `User deleted expired users.`);
        }
        return content.ExpiredUsersDeleted(result.affected);
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
                communicationsLanguage: 'fi',
                gender: genders[Math.floor(Math.random() * genders.length)],
                birthday: date,
                homeYouthClub: (Math.floor(Math.random() * 14) + 1).toString(),
                status: Math.random() < 0.5 ? Status.accepted : Status.pending,
                photoPermission: Math.random() < 0.5 ? true : false
            } as RegisterJuniorDto;
            await this.registerJunior(data, undefined, true);
        }
        return `Created ${num.toString()} juniors.`;
    }

    /**
     * This is a test method, only to be used during testing.
     */
    async deleteTestDataJuniors(): Promise<string> {
        const juniors = await this.listAllJuniors();
        const ids = juniors.data.filter(j => j.phoneNumber.substring(0, 6) === "358777").map(j => j.id);
        for (var i = 0; i < ids.length; i++) {
            await this.deleteJunior(ids[i]);
        }
        return `Deleted ${ids.length.toString()} juniors.`;
    }
}
