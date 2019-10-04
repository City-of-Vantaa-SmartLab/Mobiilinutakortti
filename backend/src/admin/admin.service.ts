import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { Repository } from 'typeorm';
import { RegisterAdminDto } from './dto';
import { AuthenticationService } from 'src/authentication/authentication.service';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
    ) { }

    async getUser(email: string): Promise<Admin> {
        return await this.adminRepo.findOne({ where: email.toLowerCase() });
    }

    async createUser(details: Admin) {
        details.email = details.email.toLowerCase();
        await this.adminRepo.save(details);
    }
}
