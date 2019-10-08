import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Junior } from './junior.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginJuniorDto } from './dto';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class JuniorService {

    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @Inject(forwardRef(() => AuthenticationService))
        private readonly authenticationService: AuthenticationService,
    ) { }

    login = async (loginData: LoginJuniorDto) => this.authenticationService.loginJunior(loginData);

    async getUser(phoneNumber: string): Promise<Junior> {
        return await this.juniorRepo.findOne({ phoneNumber });
    }

    async createUser(details: Junior) {
        await this.juniorRepo.save(details);
    }

    // This will be moved to its own service when the pin workflow is produced.
    generatePin(): string {
        return (Math.floor(1000 + Math.random() * 9000)).toString();
    }
}
