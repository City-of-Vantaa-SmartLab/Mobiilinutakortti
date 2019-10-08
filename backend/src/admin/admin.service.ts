import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { AuthenticationService } from '../authentication/authentication.service';
import { RegisterAdminDto, LoginAdminDto } from './dto';
import { RegisterJuniorDto } from '../junior/dto';
import * as content from '../content.json';

@Injectable()
export class AdminService {

    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        private readonly authenticationService: AuthenticationService,
    ) { }

    register = async (registrationData: RegisterAdminDto) => this.authenticationService.registerAdmin(registrationData);
    login = async (loginData: LoginAdminDto) => this.authenticationService.loginAdmin(loginData);
    registerJunior = async (registrationData: RegisterJuniorDto) => this.authenticationService.registerJunior(registrationData);

    // This will be handed to a guard once a clear workflow is provided for admin login.
    verifyIsAdmin = async (email: string) => { if (!(await this.getUser(email))) { throw new UnauthorizedException(content.NotAnAdmin); } };

    async getUser(email: string): Promise<Admin> {
        return await this.adminRepo.findOne({ email: email.toLowerCase() });
    }

    async createUser(details: Admin) {
        details.email = details.email.toLowerCase();
        await this.adminRepo.save(details);
    }
}
