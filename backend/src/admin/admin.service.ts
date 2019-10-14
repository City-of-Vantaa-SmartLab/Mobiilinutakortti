import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as content from '../content.json';
import { RegisterAdminDto } from './dto';
import { hash } from 'bcrypt';
import { saltRounds } from '../authentication/authentication.consts';
import { EditAdminDto } from './dto/edit.dto';
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

    async getAdmin(email: string): Promise<Admin> {
        return await this.adminRepo.findOne({ email });
    }

    async createAdmin(details: Admin) {
        await this.adminRepo.save(details);
    }

    async registerAdmin(registrationData: RegisterAdminDto): Promise<string> {
        const userExists = await this.getAdmin(registrationData.email);
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
            const emailInUse = await this.getAdmin(details.email);
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
