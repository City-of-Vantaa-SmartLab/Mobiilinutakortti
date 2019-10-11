import { Injectable, UnauthorizedException, Inject, forwardRef, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as content from '../content.json';
import { RegisterAdminDto } from './dto';
import { hash } from 'bcrypt';
import { saltRounds } from '../authentication/authentication.consts';

@Injectable()
export class AdminService {

    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
    ) { }

    // This will be handed to a guard once a clear workflow is provided for admin login.
    verifyIsAdmin = async (email: string) => { if (!(await this.getAdmin(email))) { throw new UnauthorizedException(content.NotAnAdmin); } };

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

}
