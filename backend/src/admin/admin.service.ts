import { Injectable, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { Repository } from 'typeorm';
import { AuthenticationService } from '../authentication/authentication.service';
import { RegisterAdminDto, LoginAdminDto } from './dto';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class AdminService {

    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        private readonly authenticationService: AuthenticationService,
    ) { }

    async getUser(email: string): Promise<Admin> {
        return await this.adminRepo.findOne({ email: email.toLowerCase() });
    }

    async createUser(details: Admin) {
        details.email = details.email.toLowerCase();
        await this.adminRepo.save(details);
    }

    async register(r: RegisterAdminDto) {
        return this.authenticationService.registerAdmin(r);
    }

    async login(l: LoginAdminDto) {
        return this.authenticationService.loginAdmin(l);
    }

    /** Test Code */
    async getAll1() {
        const r = await this.adminRepo.find();
        return r.map(a => a.firstName);
    }

    async getAll2() {
        return await this.adminRepo.find();
    }
}
