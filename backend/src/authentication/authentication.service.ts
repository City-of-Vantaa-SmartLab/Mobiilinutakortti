import {
    BadRequestException,
    Body,
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {compare} from 'bcrypt';
import {AdminService} from '../admin/admin.service';
import {LoginAdminDto} from '../admin/dto';
import * as content from '../content.json';
import {LoginJuniorDto} from '../junior/dto';
import {JuniorService} from '../junior/junior.service';
import {JWTToken} from './jwt.model';
import {jwt} from './authentication.consts';
import { AcsDto, SecurityContextDto } from './dto';
import {sign, unsign} from 'cookie-signature';
import {secretString} from './secret';
import * as moment from 'moment';

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
            const timeRemaining = new Date((new Date((await this.adminService.getLockoutRecord(user.id)).expiry).getTime() - new Date().getTime()));
            const hoursRemaining = timeRemaining.getUTCHours();
            throw new ForbiddenException(`${content.LockedOut} Kokeile uudestaan ${hoursRemaining} tunnin päästä.`);
        }
        return await this.validateAdmin({
            provided: loginData.password, expected: user.password,
        }, user.id);
    }

    async loginJunior(loginData: LoginJuniorDto): Promise<JWTToken> {
        const challengeResponse = await this.juniorService.attemptChallenge(loginData.id, loginData.challenge);
        if (!challengeResponse) { throw new UnauthorizedException(content.FailedLogin); }
        return this.signToken(challengeResponse);
    }

    private async validateAdmin(attempt: { provided: string, expected: string }, userId: string): Promise<JWTToken> {
        const passwordMatch = await compare(attempt.provided, attempt.expected);
        if (!passwordMatch) {
            await this.adminService.addFailedAttempt(userId);
            throw new UnauthorizedException(content.FailedLogin);
        }
        await this.adminService.deleteLockoutRecord(userId);
        return this.signToken(userId, true);
    }

    signToken(userId: string, isAdmin = false): JWTToken {
        const expiry = isAdmin ? jwt.adminExpiry : jwt.juniorExpiry;
        return { access_token: this.jwtService.sign({ sub: userId }, { expiresIn: expiry }) };
    }

    generateSecurityContext(@Body() acsData: AcsDto): SecurityContextDto {
        const { sessionIndex, nameId, firstName, lastName, zipCode } = acsData;
        const expiryTime = ((new Date().getTime() / 1000) + 3600).toString();
        // TODO/FIXME: if multiple first names, this will fail?
        const signed = sign(`${expiryTime} ${sessionIndex} ${nameId} ${firstName} ${lastName} ${zipCode}`, secretString);
        return {
            sessionIndex,
            nameId,
            firstName,
            lastName,
            zipCode,
            expiryTime,
            signedString: signed
        } as SecurityContextDto;
    }

    validateSecurityContext(@Body() securityContext: SecurityContextDto): boolean {
        const { sessionIndex, nameId, firstName, lastName, zipCode, expiryTime, signedString } = securityContext;
        const timestampValid = Number(expiryTime) > new Date().getTime() / 1000;
        const signatureValid = unsign(signedString, secretString) === `${expiryTime} ${sessionIndex} ${nameId} ${firstName} ${lastName} ${zipCode}`;
        return timestampValid && signatureValid;
    }
}
