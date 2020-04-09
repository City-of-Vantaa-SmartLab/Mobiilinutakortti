import { Injectable, InternalServerErrorException, HttpService, Logger } from '@nestjs/common';
import { Recipient, TeliaMessageRequest } from './models';
import { Challenge } from '../junior/entities';
import { SMSConfig } from './smsConfigHandler';
import * as content from '../content.json';
import { ConfigHelper } from '../configHandler';

@Injectable()
export class SmsService {

    private readonly logger = new Logger('SMS Service');

    constructor(
        private readonly httpService: HttpService) { }

    async sendVerificationSMS(recipient: Recipient, challenge: Challenge): Promise<boolean> {
        const settings = SMSConfig.getTeliaConfig();
        if (!settings) { throw new InternalServerErrorException(content.MessengerServiceNotAvailable); }
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
}
