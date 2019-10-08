import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { AuthenticationService } from '../authentication/authentication.service';
import { RegisterAdminDto, LoginAdminDto } from './dto';

@Injectable()
export class AdminService {

    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        private readonly authenticationService: AuthenticationService,
    ) { }

    register = async (registrationData: RegisterAdminDto) => this.authenticationService.registerAdmin(registrationData);
    login = async (loginData: LoginAdminDto) => this.authenticationService.loginAdmin(loginData);

    async getUser(email: string): Promise<Admin> {
        return await this.adminRepo.findOne({ email: email.toLowerCase() });
    }

    async createUser(details: Admin) {
        details.email = details.email.toLowerCase();
        await this.adminRepo.save(details);
    }

    /** TEST CODE STARTS */
    getAll1 = async () => (await this.adminRepo.find()).map(r => r.firstName);
    getAll2 = async () => (await this.adminRepo.find()).map(r => `${r.firstName} ${r.lastName}`);
    /** TEST CODE ENDS */
}
