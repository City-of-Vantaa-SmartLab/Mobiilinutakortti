import { Injectable, Inject, forwardRef, ConflictException } from '@nestjs/common';
import { Junior } from './junior.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterJuniorDto } from './dto';
import { hash } from 'bcrypt';
import { saltRounds } from '../authentication/authentication.consts';
import * as content from '../content.json';

@Injectable()
export class JuniorService {

    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
    ) { }

    async getJunior(phoneNumber: string): Promise<Junior> {
        return await this.juniorRepo.findOne({ phoneNumber });
    }

    async createJunior(details: Junior) {
        await this.juniorRepo.save(details);
    }

    /**
     * TODO:
     * Currently this returns the pin as we need pass that back to frontend.
     * Will be corrected when relevant workflow is introduced.
     */
    async registerJunior(registrationData: RegisterJuniorDto): Promise<string> {
        const userExists = await this.getJunior(registrationData.phoneNumber);
        if (userExists) { throw new ConflictException(content.AdminAlreadyExists); }
        const pin = this.generatePin();
        const hashedPassword = await hash(pin, saltRounds);
        const junior = {
            firstName: registrationData.firstName, lastName: registrationData.lastName,
            phoneNumber: registrationData.phoneNumber, pin: hashedPassword,
        } as Junior;
        await this.createJunior(junior);
        // return `${registrationData.phoneNumber} ${content.Created} (PIN:${pin})`;
        return pin.toString();
    }

    // This will be moved to its own service when the pin workflow is produced.
    generatePin(): string {
        return (Math.floor(1000 + Math.random() * 9000)).toString();
    }
}
