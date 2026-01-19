import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Recipient, TeliaMessageRequest, TeliaBatchMessageRequest, BatchItem } from './models';
import { Challenge } from '../junior/entities';
import { SMSConfig } from './smsConfigHandler';
import { ClubService } from '../club/club.service';
import * as content from '../content';
import { ConfigHandler } from '../configHandler';
import { standardizePhoneNumber } from '../common/transformers';
import moment from 'moment';

@Injectable()
export class SmsService {

    private readonly logger = new Logger('SMS Service');

    constructor(
        private readonly clubService: ClubService,
        private readonly httpService: HttpService,
        ) { }

    async sendVerificationSMS(recipient: Recipient, challenge: Challenge): Promise<boolean> {
        const settings = SMSConfig.getTeliaConfig();

        // check stack trace to see if sendVerificationSMS() is called from registerJunior()
        const checkRegisterJuniorCalls = new Error().stack.split("at ")[2].includes("registerJunior");

        if (!settings) {
            throw new InternalServerErrorException(
                checkRegisterJuniorCalls ?
                content.SMSNotAvailableButUserCreated :
                content.SmsServiceNotAvailable
            );
        }

        const message = await this.getRegisteredMessage(recipient.lang, challenge, recipient.homeYouthClub);

        const messageRequest = {
            username: settings.username, password: settings.password,
            from: settings.user, to: [recipient.phoneNumber], message,
        } as TeliaMessageRequest;

        const attemptMessage = await this.sendMessageToUser(messageRequest, settings.endPoint);
        if (attemptMessage) {
            return true;
        } else {
            throw new InternalServerErrorException(content.SmsServiceNotAvailable);
        }
    }

    async sendNewSeasonSMS(recipients: Recipient[], expireDate: string): Promise<boolean> {
        const {
            user,
            username,
            password,
            batchEndPoint,
        } = SMSConfig.getTeliaConfig();

        // NB: not sending recipient names anymore because sometimes the parents' phone numbers have typos in them. This apparently created unnecessary security risks. The phone numbers used here are for the parents.
        const batch: BatchItem[] = recipients.map(recipient => ({
            t: recipient.phoneNumber,
            m: this.getExpiredMessage(recipient.lang, expireDate),
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
            throw new InternalServerErrorException(content.SmsServiceNotAvailable);
        }
    }

    /**
     * Sends multiple messages in a single batch. The service withstands payloads in excess of
     * 100 000 individual messages per batch.
     */
    async batchSendMessagesToUsers(messageRequest: TeliaBatchMessageRequest, endpoint: string): Promise<boolean> {
        if (messageRequest.batch.length === 0) {
            this.logger.log('SMS batch size is zero, not sending anything.');
            return true;
        }
        this.logger.log(`Batch sending ${messageRequest.batch.length} SMSs.`);

        try {
            const response = await lastValueFrom(this.httpService.post(endpoint, messageRequest));
            const { batchid, batchstatuscode, batchstatusdescription } = response.data;
            if (batchstatuscode === 1) {
                this.logger.log(`Batch ID ${batchid} received successfully: ${batchstatusdescription}, code ${batchstatuscode}`);
                return true;
            } else {
                this.logger.log(`Batch ID ${batchid} failed: ${batchstatusdescription}, code ${batchstatuscode}`);
                return false;
            }
        } catch {
            this.logger.log('Batch send failed: endpoint responded with a non 200 status.');
            return false;
        }
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
        this.logger.log(`Sending SMS to xxxxxx${messageRequest.to[0].slice(-4)}`);

        try {
            const response = await lastValueFrom(this.httpService.post(teliaEndPoint, messageRequest));
            // The accepted list of phone numbers does not seem to include the '+' sign, so standardize before comparison.
            if (standardizePhoneNumber.to(response.data.accepted[0].to) === messageRequest.to[0]) {
                this.logger.log(`SMS send to xxxxxx${messageRequest.to[0].slice(-4)}`);
                return true;
            } else {
                this.logger.log(`Failed to send SMS to xxxxxx${messageRequest.to[0].slice(-4)}: ${response?.statusText}.`);
                return false;
            }
        } catch {
            this.logger.log(`POST error: failed to send SMS to xxxxxx${messageRequest.to[0].slice(-4)}.`);
            return false;
        }
    }

    private async getRegisteredMessage(lang: content.Language, challenge: Challenge, homeYouthClub?: number) {
        const oneTimeLink = `${ConfigHandler.getFrontendUrl()}/login?challenge=${challenge.challenge}&id=${challenge.id}`;
        const clubSpecificMessage = homeYouthClub ? (await this.clubService.getClubById(homeYouthClub))?.messages[lang] : '';
        return content.RegisteredSmsContent[lang](oneTimeLink, clubSpecificMessage);
    }

    private getExpiredMessage(lang: content.Language, expiredDate: string): string {
        return content.ExpiredSmsContent[lang](
            this.getSeasonPeriod(),
            moment(expiredDate).format('DD.MM.YYYY'),
            ConfigHandler.getFrontendUrl() + '/hae'
        )
    }

    private getSeasonPeriod(): string {
        const currentYear = new Date().getFullYear()
        return `${currentYear} - ${currentYear + 1}`
    }
}
