import {
    BadRequestException,
    Body,
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService} from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { compare } from 'bcrypt';
import { YouthWorkerService } from '../youthWorker/youthWorker.service';
import { LoginYouthWorkerDto } from '../youthWorker/dto';
import * as content from '../content';
import { LoginJuniorDto } from '../junior/dto';
import { JuniorService } from '../junior/junior.service';
import { JWTToken } from './jwt.model';
import { getAudienceAndScope, getPublicKey, jwt} from './authentication.consts';
import { AcsDto, SecurityContextDto } from './dto';
import { sign, unsign } from 'cookie-signature';
import { secretString } from './secret';
import { SessionDBService } from '../session/sessiondb.service';
import { LoginYouthWorkerEntraDto } from 'src/youthWorker/dto/login.dto';
import {verify} from 'jsonwebtoken'

@Injectable()
export class AuthenticationService {
    private readonly logger = new Logger('Authentication Service');

    constructor(
        @Inject(forwardRef(() => YouthWorkerService))
        private readonly youthWorkerService: YouthWorkerService,
        @Inject(forwardRef(() => JuniorService))
        private readonly juniorService: JuniorService,
        private readonly jwtService: JwtService,
        private readonly sessionDBService: SessionDBService
    ) { }

    async loginYouthWorkerEntraID(loginData: LoginYouthWorkerEntraDto): Promise<JWTToken> {
        const algorithm= "RS256";
        const tokenParts = loginData.token.split(".");

        if (tokenParts.length !== 3) {
          this.logger.error("Entra AD token has incorrect format.");
          return;
        }
        const [headerB64, payloadB64] = tokenParts;
        try {
          const header = JSON.parse(Buffer.from(headerB64, "base64").toString());
          // Kid claim indicates the particular public key that was used to validate the token.
          const publicKey = header.kid ? await getPublicKey(header.kid) : null;
      
          if (!publicKey) {
            return;
          }
          // Todo: tarviiko audiencea ja scopea tarkistaa
          const { aud, scp } = getAudienceAndScope(payloadB64);
          // TODO: audience and scope envs.
          if (aud !== process.env.ENTRA_APP_AUDIENCE || !scp.includes(process.env.ENTRA_APP_SCOPE)) {
            this.logger.error("Invalid audience or scope.");
            return;
          }

          verify(loginData.token, publicKey, {algorithms: [algorithm], audience: process.env.ENTRA_APP_AUDIENCE});
        } catch (err) {
            this.logger.error("Entra AD token validation failed.");
            const error: string = err as string;
            this.logger.error(error);
            return;
        }

    //    const token = this.signToken(user.id, true);
    //    this.sessionDBService.addSession(user.id, token.access_token);
    //    this.logger.log(`User login: ${user.id} (${user.email})`);
    //    return token;
    }

    async loginYouthWorker(loginData: LoginYouthWorkerDto): Promise<JWTToken> {
        const user = await this.youthWorkerService.getYouthWorkerByEmail(loginData.email);
        if (!user) { throw new BadRequestException(content.UserNotFound); }

        const lockedOut = await this.youthWorkerService.isLockedOut(user.id);
        if (lockedOut) {
            const timeRemaining = new Date((new Date((await this.youthWorkerService.getLockoutRecord(user.id)).expiry).getTime() - new Date().getTime()));
            const hoursRemaining = timeRemaining.getUTCHours();
            throw new ForbiddenException(`${content.LockedOut} Kokeile uudestaan ${hoursRemaining} tunnin päästä.`);
        }

        await this.validateYouthWorker({ provided: loginData.password, expected: user.password }, user.id);

        const token = this.signToken(user.id, true);
        this.sessionDBService.addSession(user.id, token.access_token);
        this.logger.log(`User login: ${user.id} (${user.email})`);
        return token;
    }

    async logoutYouthWorker(youthWorkerData: { userId: string, authToken: string }): Promise<boolean> {
        return this.sessionDBService.logoutUser(youthWorkerData.userId);
    }

    async loginJunior(loginData: LoginJuniorDto): Promise<JWTToken> {
        const challengeResponse = await this.juniorService.attemptChallenge(loginData.id, loginData.challenge);
        if (!challengeResponse) { throw new UnauthorizedException(content.FailedLogin); }
        return this.signToken(challengeResponse);
    }

    private async validateYouthWorker(attempt: { provided: string, expected: string }, userId: string): Promise<void> {
        const passwordMatch = await compare(attempt.provided, attempt.expected);
        if (!passwordMatch) {
            await this.youthWorkerService.addFailedAttempt(userId);
            throw new UnauthorizedException(content.FailedLogin);
        }
        await this.youthWorkerService.deleteLockoutRecord(userId);
    }

    signToken(userId: string, isYouthWorker = false): JWTToken {
        const expiry = isYouthWorker ? jwt.youthWorkerExpiry : jwt.juniorExpiry;
        return { access_token: this.jwtService.sign({ sub: userId }, { expiresIn: expiry }) };
    }

    updateAuthToken(youthWorkerData: { userId: string, authToken: string }): JWTToken {
        const newToken = this.signToken(youthWorkerData.userId, true);
        this.sessionDBService.addSession(youthWorkerData.userId, newToken.access_token);
        return newToken;
    }

    generateSecurityContext(@Body() acsData: AcsDto): SecurityContextDto {
        // Note: there might be multiple first names but it doesn't matter here.
        const { sessionIndex, nameId, firstName, lastName, zipCode } = acsData;
        const expiryTime = ((new Date().getTime() / 1000) + 3600).toString();
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
        const now = new Date();
        const timestampValid = Number(expiryTime) > now.getTime() / 1000;
        if (!timestampValid) {
            this.logger.warn(`Invalid timestamp`);
        }

        const unsigned = unsign(signedString || "", secretString);
        const expected = `${expiryTime} ${sessionIndex} ${nameId} ${firstName} ${lastName} ${zipCode}`;
        const signatureValid = unsigned === expected;
        if (!unsigned) {
            this.logger.error('Unable to decrypt signature')
        }
        if (!signatureValid) {
            this.logger.error(`Signatures don't match`)
        }

        return timestampValid && signatureValid;
    }
}
