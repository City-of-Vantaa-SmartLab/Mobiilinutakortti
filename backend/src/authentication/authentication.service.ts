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
