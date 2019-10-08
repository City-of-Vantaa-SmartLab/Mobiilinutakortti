import { Injectable, Inject, forwardRef, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { saltRounds } from './authentication.consts';
import { Admin } from '../admin/admin.entity';
import { AdminService } from '../admin/admin.service';
import { RegisterAdminDto, LoginAdminDto } from '../admin/dto';
import * as content from '../content.json';
import { RegisterJuniorDto, LoginJuniorDto } from '../junior/dto';
import { JuniorService } from '../junior/junior.service';
import { Junior } from '../junior/junior.entity';

@Injectable()
export class AuthenticationService {
    constructor(
        @Inject(forwardRef(() => AdminService))
        private readonly adminService: AdminService,
        @Inject(forwardRef(() => JuniorService))
        private readonly juniorService: JuniorService,
        private readonly jwtService: JwtService) { }

    async registerAdmin(registrationData: RegisterAdminDto): Promise<any> {
        const userExists = await this.adminService.getUser(registrationData.email);
        if (userExists) { throw new ConflictException(content.AdminAlreadyExists); }
        const hashedPassword = await hash(registrationData.password, saltRounds);
        const admin = {
            firstName: registrationData.firstName, lastName: registrationData.lastName,
            email: registrationData.email, password: hashedPassword,
        } as Admin;
        await this.adminService.createUser(admin);
        return `${registrationData.email} ${content.Created}`;
    }

    /**
      Currently this returns the pin as we need pass that back to frontend.
      Will be corrected when relevant workflow is introduced.
     */
    async registerJunior(registrationData: RegisterJuniorDto): Promise<string> {
        const userExists = await this.juniorService.getUser(registrationData.phoneNumber);
        if (userExists) { throw new ConflictException(content.AdminAlreadyExists); }
        const pin = this.juniorService.generatePin();
        const hashedPassword = await hash(pin, saltRounds);
        const junior = {
            firstName: registrationData.firstName, lastName: registrationData.lastName,
            phoneNumber: registrationData.phoneNumber, pin: hashedPassword,
        } as Junior;
        await this.juniorService.createUser(junior);
        // return `${registrationData.phoneNumber} ${content.Created} (PIN:${pin})`;
        return pin.toString();
    }

    async loginAdmin(loginData: LoginAdminDto): Promise<any> {
        const user = await this.adminService.getUser(loginData.email);
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        return await this.validateUser({
            providedPassword: loginData.password, hashedPassword: user.password,
        }, {
            id: user.id, identity: user.email,
        });
    }

    async loginJunior(loginData: LoginJuniorDto): Promise<any> {
        const user = await this.juniorService.getUser(loginData.phoneNumber);
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        return await this.validateUser({
            providedPassword: loginData.pin, hashedPassword: user.pin,
        }, {
            id: user.id, identity: user.pin,
        });
    }

    async validateUser(attempt: { providedPassword: string, hashedPassword: string }, user: { id: number, identity: string }): Promise<any> {
        const passwordMatch = await compare(attempt.providedPassword, attempt.hashedPassword);
        if (!passwordMatch) { throw new UnauthorizedException(content.FailedLogin); }
        return { access_token: this.jwtService.sign({ user: user.identity, sub: user.id }) };
    }

}
