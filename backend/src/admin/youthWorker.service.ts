import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin, Lockout } from './entities';
import * as content from '../content';
import { EditAdminDto, RegisterAdminDto } from './dto';
import { hash, compare } from 'bcrypt';
import { saltRounds, maximumAttempts } from '../authentication/authentication.consts';
import { AdminUserViewModel } from './vm/youthWorker.vm';
import { ChangePasswordDto } from './dto/changePassword.dto';

/**
 * A service designed to deal with Admin actions.
 */
@Injectable()
export class AdminService {

    /**
     * @param adminRepo - The admin repository.
     */
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(Lockout)
        private readonly lockoutRepo: Repository<Lockout>,
    ) { }

    /**
     * @returns AdminUserViewModel[] - a List of all admins in ViewModel form.
     */
    async listAllAdmins(): Promise<AdminUserViewModel[]> {
        return (await this.adminRepo.find()).map(e => new AdminUserViewModel(e));
    }

    /**
     * @param id - the id of the admin.
     * @returns Promise<Admin> - the Admin entity being searched for.
     */
    async getAdmin(id: string): Promise<Admin> {
        return await this.adminRepo.findOneBy({ id });
    }

    /**
     * @param email - the email of the admin.
     * @returns Promise<Admin> - the Admin entity being searched for.
     */
    async getAdminByEmail(email: string): Promise<Admin> {
        return await this.adminRepo.findOneBy({ email });
    }

    /**
     * @param details - the Admin data to add.
     */
    async createAdmin(details: Admin) {
        await this.adminRepo.save(details);
    }

    /**
     * Returns the lockout record of the admin.
     * @param admin - the id of the admin.
     */
    async getLockoutRecord(adminId: string): Promise<Lockout> {
        const admin = await this.getAdmin(adminId);
        if (!admin) { throw new BadRequestException(content.UserNotFound); }
        return await this.lockoutRepo.findOne({ where: { admin }, relations: ['admin'] });
    }

    async deleteLockoutRecord(adminId: string) {
        const lockoutRecord = await this.getLockoutRecord(adminId);
        if (lockoutRecord) { await this.lockoutRepo.remove(lockoutRecord); }
    }

    /**
     * @param registrationData - the details to register.
     * @returns Promise<string> - a success message.
     */
    async registerAdmin(registrationData: RegisterAdminDto): Promise<string> {
        const userExists = await this.getAdminByEmail(registrationData.email);
        if (userExists) { throw new ConflictException(content.AdminAlreadyExists); }
        const hashedPassword = await hash(registrationData.password, saltRounds);
        const admin = {
            firstName: registrationData.firstName, lastName: registrationData.lastName,
            email: registrationData.email, password: hashedPassword, isSuperUser: registrationData.isSuperUser,
            mainYouthClub: registrationData.mainYouthClub,
        } as Admin;
        await this.createAdmin(admin);
        return content.Created(registrationData.email);
    }

    async changePassword(adminId: string, changePasswordDto: ChangePasswordDto): Promise<string> {
        const user = await this.adminRepo.findOneBy({ id: adminId });
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        const passwordsMatch = await compare(changePasswordDto.oldPassword, user.password);
        if (!passwordsMatch) { throw new BadRequestException(content.IncorrectPassword); }
        const newPassword = await hash(changePasswordDto.newPassword, saltRounds);
        user.password = newPassword;
        user.passwordLastChanged = new Date();
        await this.adminRepo.save(user);
        return content.PasswordUpdated;
    }

    /**
     * @param details the details to change, including the ID of the user in question.
     * @return Promise<string>  a success message.
     */
    async editAdmin(details: EditAdminDto): Promise<string> {
        const user = await this.adminRepo.findOneBy({ id: details.id });
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        if (user.email !== details.email.toLowerCase()) {
            const emailInUse = await this.getAdminByEmail(details.email);
            if (emailInUse) { throw new ConflictException(content.AdminAlreadyExists); }
        }
        user.email = details.email;
        user.firstName = details.firstName;
        user.lastName = details.lastName;
        user.isSuperUser = details.isSuperUser;
        user.mainYouthClub = details.mainYouthClub;
        await this.adminRepo.save(user);
        return `${details.email} ${content.Updated}`;
    }

    /**
     * This method deletes the provided admin.
     * @param id the id of the user to delete.
     */
    async deleteAdmin(id: string) {
        const admin = await this.getAdmin(id);
        if (!admin) { throw new BadRequestException(content.UserNotFound); }
        this.adminRepo.remove(admin);
        return `${id} ${content.Deleted}`;
    }

    async isLockedOut(adminId: string): Promise<boolean> {
        const lockoutRecord = await this.getLockoutRecord(adminId);
        if (!lockoutRecord) { return false; }
        const expired = await this.checkLockoutExpired(lockoutRecord);
        if (expired) { return false; }
        return lockoutRecord.attempts >= maximumAttempts;
    }

    async addFailedAttempt(adminId: string) {
        let lockoutRecord = await this.getLockoutRecord(adminId);
        if (!lockoutRecord) {
            lockoutRecord = { admin: await this.getAdmin(adminId), attempts: 0 } as Lockout;
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
}
