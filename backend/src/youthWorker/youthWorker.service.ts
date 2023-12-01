import { Injectable, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YouthWorker, Lockout } from './entities';
import * as content from '../content';
import { EditYouthWorkerDto, RegisterYouthWorkerDto } from './dto';
import { hash, compare } from 'bcrypt';
import { saltRounds, maximumAttempts } from '../authentication/authentication.consts';
import { YouthWorkerUserViewModel } from './vm/youthWorker.vm';
import { ChangePasswordDto } from './dto/changePassword.dto';

/**
 * A service designed to deal with youth worker actions.
 */
@Injectable()
export class YouthWorkerService {
    private readonly logger = new Logger('Youth Worker Service');

    /**
     * @param youthWorkerRepo - The youth worker repository.
     */
    constructor(
        @InjectRepository(YouthWorker)
        private readonly youthWorkerRepo: Repository<YouthWorker>,
        @InjectRepository(Lockout)
        private readonly lockoutRepo: Repository<Lockout>,
    ) { }

    /**
     * @returns YouthWorkerUserViewModel[] - a List of all youth workers in ViewModel form.
     */
    async listAllYouthWorkers(): Promise<YouthWorkerUserViewModel[]> {
        return (await this.youthWorkerRepo.find()).map(e => new YouthWorkerUserViewModel(e));
    }

    /**
     * @param id - the id of the youth worker.
     * @returns Promise<YouthWorker> - the youth worker entity being searched for.
     */
    async getYouthWorker(id: string): Promise<YouthWorker> {
        return await this.youthWorkerRepo.findOneBy({ id });
    }

    /**
     * @param email - the email of the youth worker.
     * @returns Promise<YouthWorker> - the youth worker entity being searched for.
     */
    async getYouthWorkerByEmail(email: string): Promise<YouthWorker> {
        return await this.youthWorkerRepo.findOneBy({ email });
    }

    /**
     * @param details - the youth worker data to add.
     */
    async createYouthWorker(details: YouthWorker) {
        await this.youthWorkerRepo.save(details);
    }

    /**
     * Returns the lockout record of the youth worker.
     * @param youthWorker - the id of the youth worker.
     */
    async getLockoutRecord(youthWorkerId: string): Promise<Lockout> {
        const youthWorker = await this.getYouthWorker(youthWorkerId);
        if (!youthWorker) { throw new BadRequestException(content.UserNotFound); }
        return await this.lockoutRepo.findOne({ where: { youthWorker }, relations: ['youthWorker'] });
    }

    async deleteLockoutRecord(youthWorkerId: string) {
        const lockoutRecord = await this.getLockoutRecord(youthWorkerId);
        if (lockoutRecord) { await this.lockoutRepo.remove(lockoutRecord); }
    }

    /**
     * @param registrationData - the details to register.
     * @returns Promise<string> - a success message.
     */
    async registerYouthWorker(registrationData: RegisterYouthWorkerDto, adminId?: string): Promise<string> {
        const userExists = await this.getYouthWorkerByEmail(registrationData.email);
        if (userExists) { throw new ConflictException(content.YouthWorkerAlreadyExists); }
        const hashedPassword = await hash(registrationData.password, saltRounds);
        const youthWorker = {
            firstName: registrationData.firstName, lastName: registrationData.lastName,
            email: registrationData.email, password: hashedPassword, isAdmin: registrationData.isAdmin,
            mainYouthClub: registrationData.mainYouthClub,
        } as YouthWorker;
        await this.createYouthWorker(youthWorker);

        if (adminId) {
            this.logger.log({ adminId: adminId, youthWorkerEmail: registrationData.email }, registrationData.isAdmin ? ' Admin created new admin user.' : 'Admin created new youth worker.');
        }
        return content.Created(registrationData.email);
    }

    async changePassword(youthWorkerId: string, changePasswordDto: ChangePasswordDto): Promise<string> {
        const user = await this.youthWorkerRepo.findOneBy({ id: youthWorkerId });
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        const passwordsMatch = await compare(changePasswordDto.oldPassword, user.password);
        if (!passwordsMatch) { throw new BadRequestException(content.IncorrectPassword); }
        const newPassword = await hash(changePasswordDto.newPassword, saltRounds);
        user.password = newPassword;
        user.passwordLastChanged = new Date();
        await this.youthWorkerRepo.save(user);

        this.logger.log({ youthWorkerId: user.id }, 'Youth worker changed their password.');
        return content.PasswordUpdated;
    }

    /**
     * @param details the details to change, including the ID of the user in question.
     * @return Promise<string>  a success message.
     */
    async editYouthWorker(details: EditYouthWorkerDto, adminId: string): Promise<string> {
        const user = await this.youthWorkerRepo.findOneBy({ id: details.id });
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        if (user.email !== details.email.toLowerCase()) {
            const emailInUse = await this.getYouthWorkerByEmail(details.email);
            if (emailInUse) { throw new ConflictException(content.YouthWorkerAlreadyExists); }
        }

        const wasAdmin = user.isAdmin;
        user.email = details.email;
        user.firstName = details.firstName;
        user.lastName = details.lastName;
        user.isAdmin = details.isAdmin;
        user.mainYouthClub = details.mainYouthClub;
        await this.youthWorkerRepo.save(user);

        const note = (wasAdmin && !details.isAdmin) ? ' Youth worker is no longer an admin.' : ((details.isAdmin && !wasAdmin) ? ' Youth worker is now an admin.' : '');
        this.logger.log({ adminId: adminId, youthWorkerId: user.id }, 'Admin modified youth worker.' + note);
        return `${details.email} ${content.Updated}`;
    }

    /**
     * This method deletes the provided youth worker.
     * @param id the id of the user to delete.
     */
    async deleteYouthWorker(id: string, adminId: string) {
        const youthWorker = await this.getYouthWorker(id);
        if (!youthWorker) { throw new BadRequestException(content.UserNotFound); }
        this.youthWorkerRepo.remove(youthWorker);
        this.logger.log({ adminId: adminId, youthWorkerId: id }, 'Admin deleted youth worker.');
        return `${id} ${content.Deleted}`;
    }

    async isLockedOut(youthWorkerId: string): Promise<boolean> {
        const lockoutRecord = await this.getLockoutRecord(youthWorkerId);
        if (!lockoutRecord) { return false; }
        const expired = await this.checkLockoutExpired(lockoutRecord);
        if (expired) { return false; }
        return lockoutRecord.attempts >= maximumAttempts;
    }

    async addFailedAttempt(youthWorkerId: string) {
        let lockoutRecord = await this.getLockoutRecord(youthWorkerId);
        if (!lockoutRecord) {
            lockoutRecord = { youthWorker: await this.getYouthWorker(youthWorkerId), attempts: 0 } as Lockout;
        }
        lockoutRecord.attempts++;
        await this.lockoutRepo.save(lockoutRecord);
    }

    private async checkLockoutExpired(lockout: Lockout): Promise<boolean> {
        const expired = new Date(lockout.expiry) < new Date();
        if (!expired) { return false; }
        await this.lockoutRepo.remove(lockout);
        return true;
    }

    async setMainYouthClub(clubId: string, userId: string): Promise<boolean> {
        const youthWorker = await this.getYouthWorker(userId);
        if (!youthWorker) { throw new BadRequestException(content.UserNotFound); }
        try {
            youthWorker.mainYouthClub = parseInt(clubId);
        } catch {
            throw new BadRequestException(content.ClubNotFound);
        }
        await this.youthWorkerRepo.save(youthWorker);
        this.logger.log({ youthWorkerId: userId, clubId: clubId }, 'Youth worker updated their main youth club.');
        return true;
    }
}
