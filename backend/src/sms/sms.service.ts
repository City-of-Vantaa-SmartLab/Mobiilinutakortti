import { Injectable, InternalServerErrorException, HttpService, Logger } from '@nestjs/common';
import { Recipient, TeliaMessageRequest } from './models';
import { Challenge } from '../junior/entities';
import { SMSConfig } from './smsConfigHandler';
import * as content from '../content.json';
import { ConfigHelper } from '../configHandler';
import moment = require('moment');

@Injectable()
export class SmsService {

    private readonly logger = new Logger('SMS Service');

    constructor(
        private readonly httpService: HttpService) { }

    async sendVerificationSMS(recipient: Recipient, challenge: Challenge): Promise<boolean> {
        const settings = SMSConfig.getTeliaConfig();

        // check stack trace to see if sendVerificationSMS() is called from registerJunior()
        const checkRegisterJuniorCalls = new Error().stack.split("at ")[2].includes("registerJunior");

        if (!settings) {
            if (checkRegisterJuniorCalls) {
                throw new InternalServerErrorException(content.SMSNotAvailableButUserCreated);
            }
            else {
                throw new InternalServerErrorException(content.MessengerServiceNotAvailable);
            }
        }

        const oneTimeLink = this.getOneTimeLink(challenge);
        const message = this.getMessage(recipient.name, content.SMSSender, oneTimeLink, content.SMSSignature);
        const messageRequest = {
            username: settings.username, password: settings.password,
            from: settings.user, to: [recipient.phoneNumber], message,
        } as TeliaMessageRequest;
        const attemptMessage = await this.sendMessageToUser(messageRequest, settings.endPoint);
        if (attemptMessage) {
            return true;
        } else {
            throw new InternalServerErrorException(content.MessengerServiceNotAvailable);
        }
    }

    async sendNewSeasonSMS(recipient: Recipient, expireDate: string): Promise<boolean> {
        const settings = SMSConfig.getTeliaConfig();

        const message = this.getExpiredMessage(recipient.name, expireDate);

        const messageRequest = {
            username: settings.username, password: settings.password,
            from: settings.user, to: [recipient.phoneNumber], message,
        } as TeliaMessageRequest;
        const attemptMessage = await this.sendMessageToUser(messageRequest, settings.endPoint);
        if (attemptMessage) {
            return true;
        } else {
            throw new InternalServerErrorException(content.MessengerServiceNotAvailable);
        }
    }

    private async sendMessageToUser(messageRequest: TeliaMessageRequest, teliaEndPoint: string): Promise<boolean> {
        this.logger.log(`Sending SMS to ${messageRequest.to[0]}`);
        return this.httpService.post(teliaEndPoint, messageRequest).toPromise().then(
            response => {
                if (response.data.accepted[0].to === messageRequest.to[0]) {
                    this.logger.log(`SMS send to ${messageRequest.to[0]}`);
                    return true;
                } else {
                    this.logger.log(`Failed to send SMS to ${messageRequest.to[0]}: ${response}.`);
                    return false;
                }
            }).catch(error => {
                this.logger.log(`Failed to send SMS to ${messageRequest.to[0]}.`);
                return false;
            });

    }

    private getOneTimeLink(challenge: Challenge): string {
        return `${ConfigHelper.getFrontendPort()}/login?challenge=${challenge.challenge}&id=${challenge.id}`;
    }

    private getMessage(recipientName: string, systemName: string, link: string, signature: string) {
        return `Hei ${recipientName}! Sinulle on luotu oma Nutakortti. Voit kirjautua palveluun kertakäyttöisen kirjautumislinkin avulla ${link}  - ${signature}`;
    }

    private getExpiredMessage(recipientName: string, expiredDate: string): string {
        return `Hei

Nuoren ${recipientName} Mobiilinutakortti odottaa uusimista kaudelle ${this.getSeasonPeriod()}. Alla olevasta linkistä pääset uusimaan nuoren hakemuksen ja päivittämään yhteystiedot. Edellisen kauden QR-koodi lakkaa toimimasta ${moment(expiredDate).format('DD.MM.YYYY')}.

${process.env.FRONTEND_BASE_URL ? `${process.env.FRONTEND_BASE_URL}/hae` : 'https://nutakortti.vantaa.fi/hae'}

Terveisin,
Vantaan nuorisopalvelut`
    }

    private getSeasonPeriod(): string {
        const currentYear = new Date().getFullYear()
        const thisTimeNextYear = new Date(new Date().setFullYear(currentYear + 1))
        const nextYear = thisTimeNextYear.getFullYear()

        return `${currentYear} - ${nextYear}`
    }
}
