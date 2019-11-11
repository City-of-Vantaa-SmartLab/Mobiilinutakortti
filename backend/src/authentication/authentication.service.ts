import { Injectable, Inject, forwardRef, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
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
        const user = await this.adminService.getAdminByEmail(loginData.email);
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        const lockedOut = await this.adminService.isLockedOut(user.id);
        if (lockedOut) {
            const timeRemaining = new Date(new Date().getTime() - new Date((await this.adminService.getLockoutRecord(user.id)).expiry).getTime());
            const hoursRemaining = timeRemaining.getHours();
            const minutesRemaining = timeRemaining.getMinutes();
            throw new ForbiddenException(`${content.LockedOut} Try again in ${hoursRemaining} hours ${minutesRemaining} minutes.`);
        }
        return await this.validateAdmin({
            provided: loginData.password, expected: user.password,
        }, user.id);
    }

    async loginJunior(loginData: LoginJuniorDto): Promise<JWTToken> {
        const challengeResponse = await this.juniorService.attemptChallenge(loginData.id, loginData.challenge);
        if (!challengeResponse) { throw new UnauthorizedException(content.FailedLogin); }
        return { access_token: this.jwtService.sign({ sub: challengeResponse }) } as JWTToken;
    }

    private async validateAdmin(attempt: { provided: string, expected: string }, userId: string): Promise<JWTToken> {
        const passwordMatch = await compare(attempt.provided, attempt.expected);
        if (!passwordMatch) {
            await this.adminService.addFailedAttempt(userId);
            throw new UnauthorizedException(content.FailedLogin);
        }
        await this.adminService.deleteLockoutRecord(userId);
        return { access_token: this.jwtService.sign({ sub: userId }) } as JWTToken;
    }

}
