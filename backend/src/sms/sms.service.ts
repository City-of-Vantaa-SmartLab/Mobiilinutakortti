import { Injectable, InternalServerErrorException, HttpService, Logger } from '@nestjs/common';
import { Recipient, TeliaMessageRequest, TeliaBatchMessageRequest, BatchItem } from './models';
import { Challenge } from '../junior/entities';
import { SMSConfig } from './smsConfigHandler';
import * as content from '../content';
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
        const message = this.getMessage(recipient.lang, recipient.name, content.SMSSender, oneTimeLink);
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

    async sendNewSeasonSMS(recipients: Recipient[], expireDate: string): Promise<boolean> {
        const {
            user,
            username,
            password,
            batchEndPoint,
        } = SMSConfig.getTeliaConfig();

        const batch: BatchItem[] = recipients.map(recipient => ({
            t: recipient.phoneNumber,
            m: this.getExpiredMessage(recipient.lang, recipient.name, expireDate),
        }));

        const messageRequest = {
            username: username,
            password: password,
            from: user,
            batch,
        } as TeliaBatchMessageRequest;
        const attemptMessage = await this.batchSendMessagesToUsers(messageRequest, batchEndPoint);
        if (attemptMessage) {
            return true;
        } else {
            throw new InternalServerErrorException(content.MessengerServiceNotAvailable);
        }
    }

    /**
     * Sends multiple messages in a single batch. The service withstands payloads in excess of
     * 100 000 individual messages per batch.
     */
    private async batchSendMessagesToUsers(messageRequest: TeliaBatchMessageRequest, endpoint: string): Promise<boolean> {
        this.logger.log(`Batch sending ${messageRequest.batch.length} SMSs.`);
        const response = await this.httpService.post(endpoint, messageRequest).toPromise();

        try {
            const { batchid, batchstatuscode, batchstatusdescription } = response.data;
            if (batchstatuscode === 1) {
                this.logger.log(`Batch ID ${batchid} received successfully: ${batchstatusdescription}, code ${batchstatuscode}`);
                return true;
            } else {
                this.logger.log(`Batch ID ${batchid} failed: ${batchstatusdescription}, code ${batchstatuscode}`);
            }
        } catch (error) {
            this.logger.log('Batch send failed: endpoint responded with a non 200 status and error:', error);
        }

        return false;
    }

    /**
     * Send a message to one or more recipients. The maximum number of recipients inside the `to`
     * property of the message request is 1000. Currently this is only used to send messages to
     * single users. If this is used for sending multiple messages, the logging needs to be
     * changed to include all the phone numbers in the `to` property.
     *
     * Use the batchSendMessagesToUsers method to send a message to more than 1000 recipients, or
     * to send individual messages to multiple users.
     */
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

    private getMessage(lang: content.Language, recipientName: string, systemName: string, link: string) {
        return content.RegisteredSmsContent[lang](recipientName, link);
    }

    private getExpiredMessage(lang: content.Language, recipientName: string, expiredDate: string): string {
        return content.ExpiredSmsContent[lang](
            recipientName,
            this.getSeasonPeriod(),
            moment(expiredDate).format('DD.MM.YYYY'),
            process.env.FRONTEND_BASE_URL ? `${process.env.FRONTEND_BASE_URL}/hae` : 'https://nutakortti.vantaa.fi/hae'
        )
    }

    private getSeasonPeriod(): string {
        const currentYear = new Date().getFullYear()
        return `${currentYear} - ${currentYear + 1}`
    }
}
