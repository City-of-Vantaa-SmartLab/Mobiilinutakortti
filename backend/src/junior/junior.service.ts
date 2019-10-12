import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Junior } from './junior.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterJuniorDto } from './dto';
import { hash } from 'bcrypt';
import { saltRounds } from '../authentication/authentication.consts';
import * as content from '../content.json';
import { EditJuniorDto } from './dto/edit.dto';
import { JuniorUserViewModel } from './vm/junior.vm';

@Injectable()
export class JuniorService {

    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
    ) { }

    async listAllJuniors(): Promise<JuniorUserViewModel[]> {
        return (await this.juniorRepo.find()).map(e => new JuniorUserViewModel(e));
    }

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

    async editJunior(details: EditJuniorDto): Promise<string> {
        const user = await this.juniorRepo.findOne(details.id);
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        user.firstName = details.phoneNumber;
        user.lastName = details.lastName;
        await this.juniorRepo.save(user);
        return `${details.phoneNumber} ${content.Updated}`;
    }
}
