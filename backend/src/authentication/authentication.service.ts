import { Injectable, Inject, forwardRef, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { AdminService } from '../admin/admin.service';
import { LoginAdminDto } from '../admin/dto';
import * as content from '../content.json';
import { LoginJuniorDto } from '../junior/dto';
import { JuniorService } from '../junior/junior.service';
import { JWTToken } from './jwt.model';

@Injectable()
export class AuthenticationService {
    constructor(
        @Inject(forwardRef(() => AdminService))
        private readonly adminService: AdminService,
        @Inject(forwardRef(() => JuniorService))
        private readonly juniorService: JuniorService,
        private readonly jwtService: JwtService) { }

    async loginAdmin(loginData: LoginAdminDto): Promise<JWTToken> {
        const user = await this.adminService.getAdmin(loginData.email);
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        return await this.validateUser({
            provided: loginData.password, expected: user.password,
        }, user.id);
    }

    async loginJunior(loginData: LoginJuniorDto): Promise<JWTToken> {
        const user = await this.juniorService.getJunior(loginData.id);
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        return await this.validateUser({
            provided: loginData.challenge,
        }, user.id);
    }

    async validateUser(attempt: { provided: string, expected?: string }, user: string): Promise<JWTToken> {
        const passwordMatch = attempt.expected ? await compare(attempt.provided, attempt.expected) :
            await this.juniorService.attemptChallenge(user, attempt.provided);

        if (!passwordMatch) { throw new UnauthorizedException(content.FailedLogin); }
        return { access_token: this.jwtService.sign({ sub: user }) } as JWTToken;
    }

}
