import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as content from '../content.json';
import { EditAdminDto, RegisterAdminDto } from './dto';
import { hash } from 'bcrypt';
import { saltRounds } from '../authentication/authentication.consts';
import { AdminUserViewModel } from './vm/admin.vm';

@Injectable()
export class AdminService {

    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
    ) { }

    async listAllAdmins(): Promise<AdminUserViewModel[]> {
        return (await this.adminRepo.find()).map(e => new AdminUserViewModel(e));
    }

    async getAdminByEmail(email: string): Promise<Admin> {
        return await this.adminRepo.findOne({ email });
    }

    async createAdmin(details: Admin) {
        await this.adminRepo.save(details);
    }

    async registerAdmin(registrationData: RegisterAdminDto): Promise<string> {
        const userExists = await this.getAdminByEmail(registrationData.email);
        if (userExists) { throw new ConflictException(content.AdminAlreadyExists); }
        const hashedPassword = await hash(registrationData.password, saltRounds);
        const admin = {
            firstName: registrationData.firstName, lastName: registrationData.lastName,
            email: registrationData.email, password: hashedPassword, isSuperUser: registrationData.isSuperUser,
        } as Admin;
        await this.createAdmin(admin);
        return `${registrationData.email} ${content.Created}`;
    }

    async editAdmin(details: EditAdminDto): Promise<string> {
        const user = await this.adminRepo.findOne(details.id);
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        if (user.email !== details.email.toLowerCase()) {
            const emailInUse = await this.getAdminByEmail(details.email);
            if (emailInUse) { throw new ConflictException(content.AdminAlreadyExists); }
        }
        user.email = details.email;
        user.firstName = details.firstName;
        user.lastName = details.lastName;
        user.isSuperUser = details.isSuperUser;
        await this.adminRepo.save(user);
        return `${details.email} ${content.Updated}`;
    }
}
