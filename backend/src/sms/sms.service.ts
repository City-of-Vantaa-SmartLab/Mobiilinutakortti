import { Injectable, InternalServerErrorException, HttpService } from '@nestjs/common';
import { Recipient, TeliaMessageRequest } from './models';
import { Challenge } from '../junior/entities';
import { SMSConfig } from './smsConfigHandler';
import * as content from '../content.json';
import { ConfigHelper } from '../configHandler';

@Injectable()
export class SmsService {

    constructor(
        private readonly httpService: HttpService) { }

    async sendVerificationSMS(recipient: Recipient, challenge: Challenge): Promise<boolean> {
        if (!ConfigHelper.isLive()) { return true; }
        const settings = SMSConfig.getTeliaConfig();
        if (!settings) { throw new InternalServerErrorException(content.MessengerServiceNotAvailable); }
        const oneTimeLink = this.getOneTimeLink(challenge);
        const message = this.getMessage(recipient.name, content.SMSSender, oneTimeLink);
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
        // tslint:disable-next-line: no-console
        console.log(`Sending SMS to ${messageRequest.to[0]}`);
        return this.httpService.post(teliaEndPoint, messageRequest).toPromise().then(
            response => {
                if (response.data.accepted[0].to === messageRequest.to[0]) {
                    // tslint:disable-next-line: no-console
                    console.log(`SMS send to ${messageRequest.to[0]}`);
                    return true;
                } else {
                    // tslint:disable-next-line: no-console
                    console.log(`Failed to send SMS to ${messageRequest.to[0]}: ${response}.`);
                    return false;
                }
            }).catch(error => {
                // tslint:disable-next-line: no-console
                console.log(`Failed to send SMS to ${messageRequest.to[0]}.`);
                return false;
            });

    }

    private getOneTimeLink(challenge: Challenge): string {
        return `${ConfigHelper.getFrontendPort()}/login?challenge=${challenge.challenge}&id=${challenge.id}`;
    }

    private getMessage(recipientName: string, systemName: string, link: string) {
        return `Hei ${recipientName}! Sinulle on luotu oma ${systemName}-tili.
         Voit kirjautua palveluun kertakäyttöisen kirjautumislinkin avulla ${link}`;
    }
}
