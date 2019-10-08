import { Injectable, Inject, forwardRef, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { saltRounds } from './authentication.consts';
import { Admin } from '../admin/admin.entity';
import { AdminService } from '../admin/admin.service';
import { RegisterAdminDto, LoginAdminDto } from '../admin/dto';
import * as content from '../content.json';

@Injectable()
export class AuthenticationService {
    constructor(
        @Inject(forwardRef(() => AdminService))
        private readonly adminService: AdminService,
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

    async loginAdmin(loginData: LoginAdminDto): Promise<any> {
        const user = await this.adminService.getUser(loginData.email);
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        const passwordMatches = await compare(loginData.password, user.password);
        if (!passwordMatches) { throw new UnauthorizedException(content.FailedLogin); }
        return { access_token: this.jwtService.sign({ user: user.email, sub: user.id }) };
    }
}
