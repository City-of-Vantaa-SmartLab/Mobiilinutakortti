import { AnnouncementData } from './classes/announcementData';
import { AnnouncementLanguageVersions } from './classes/announcementLanguageVersions';
import * as content from '../content';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { BatchItem, TeliaBatchMessageRequest } from '../sms/models';
import { ClubService } from '../club/club.service';
import { EmailAnnouncement } from '../email/models/emailModels.model';
import { EmailConfig } from '../email/emailConfigHandler';
import { EmailService } from '../email/email.service';
import { Junior } from '../junior/entities';
import { JuniorService } from '../junior/junior.service';
import { SMSConfig } from '../sms/smsConfigHandler';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AnnouncementService {

    private readonly logger = new Logger('Announcement Service');

    constructor(
        private readonly clubService: ClubService,
        private readonly smsService: SmsService,
        private readonly emailService: EmailService,
        private readonly juniorService: JuniorService
        ) { }

    private getAnnouncementWithLanguage(content: AnnouncementLanguageVersions, langCode: string): string | null {
        return content ? (content[langCode] || content.fi) : null;
    };

    private async getRecipientsByYouthClub(youthClubId: number): Promise<Junior[]> {
        const twoWeeksInSeconds = 1209600;
        const checkIns = await this.clubService.getCheckins({clubId: youthClubId, date: new Date().toString()}, twoWeeksInSeconds);
        const checkedInJuniors = checkIns.map((checkIn) => {
            return checkIn.junior;
        });

        const juniorsByHomeClub = await this.juniorService.getJuniorsByHomeYouthClub(youthClubId);
        const allRecipients = checkedInJuniors.concat(juniorsByHomeClub);
        const uniqueRecipients = new Set<Junior>(allRecipients);
        return Array.from(uniqueRecipients);
    }

    // NB: this leaves out juniors that have no home youth club unless they have visited some youth club recently.
    private async getRecipientsForAllYouthClubs(): Promise<Junior[]> {
        const activeClubs = (await this.clubService.getClubs()).filter(club => club.active);
        const recipientsByClub = await Promise.all(activeClubs.map(async(club) => await this.getRecipientsByYouthClub(club.id)));
        const recipients = recipientsByClub.reduce((a, b) => a.concat(b), []);
        return recipients;
    }

    private getEmailRecipientsByLanguage(recipients: Junior[], langCode: string): string[] {
        const filteredArray = recipients.filter((r: Junior) => r.communicationsLanguage === langCode)
                .filter((r: Junior) => r.emailPermissionParent)
                .map((r: Junior) => r.parentsEmail)
                .filter((email: string) => /^\S+@\S+\.\S+$/.test(email));
        const uniqueRecipients = new Set<string>(filteredArray);
        return Array.from(uniqueRecipients);
    };

    private createEmailDataForLanguage(announcementData: AnnouncementData, recipients: string[], lang: string): EmailAnnouncement {
        return {
            to: recipients,
            title: announcementData.title[lang] || announcementData.title["fi"],
            message: announcementData.content[lang] || announcementData.content["fi"]
        };
    };

    async clubAnnouncementSms(announcementData: AnnouncementData, userId: string): Promise<string> {
        const settings = announcementData.dryRun ? null : SMSConfig.getTeliaConfig();

        const selectedRecipients = announcementData.youthClub ?
            await this.getRecipientsByYouthClub(announcementData.youthClub) :
            await this.getRecipientsForAllYouthClubs();

        const parentBatch: BatchItem[] = announcementData.recipient.includes("parents") ?
            selectedRecipients.filter((recipient: Junior) => recipient.smsPermissionParent)
            .filter((recipient: Junior) => recipient.parentsPhoneNumber.substring(0, 6) !== "358777")
            .filter((recipient: Junior) => recipient.parentsPhoneNumber.substring(0, 6) !== "358999")
            .map((recipient: Junior) => ({
                t: recipient.parentsPhoneNumber,
                m: this.getAnnouncementWithLanguage(announcementData.content, recipient.communicationsLanguage),
            })
        ) : [];

        const juniorBatch: BatchItem[] = announcementData.recipient.includes("juniors") ?
            selectedRecipients.filter((recipient: Junior) => recipient.smsPermissionJunior)
                .filter((recipient: Junior) => recipient.phoneNumber.substring(0, 6) !== "358777")
                .filter((recipient: Junior) => recipient.phoneNumber.substring(0, 6) !== "358999")
                .map((recipient: Junior) => ({
                    t: recipient.phoneNumber,
                    m: this.getAnnouncementWithLanguage(announcementData.content, recipient.communicationsLanguage),
                })
        ) : [];

        const batch: BatchItem[] = parentBatch.concat(juniorBatch);

        if (announcementData.dryRun) {
            return batch.length.toString();
        }

        if (batch.length < 1) {
            throw new BadRequestException(content.RecipientsNotFound);
        };

        const messageRequest = {
            username: settings.username,
            password: settings.password,
            from: settings.user,
            batch,
        } as TeliaBatchMessageRequest;

        this.logger.log(`User ${userId} is sending ${batch.length} SMS messages.`);
        const attemptMessage = await this.smsService.batchSendMessagesToUsers(messageRequest, settings.batchEndPoint);
        if (attemptMessage) {
            return content.SmsBatchSent;
        } else {
            throw new InternalServerErrorException(content.SmsServiceNotAvailable);
        };
    };

    async clubAnnouncementEmail(announcementData: AnnouncementData, userId: string): Promise<string> {
        const settings = announcementData.dryRun ? null : EmailConfig.getEmailConfig();

        const selectedRecipients = announcementData.youthClub ?
            await this.getRecipientsByYouthClub(announcementData.youthClub) :
            await this.getRecipientsForAllYouthClubs();

        const recipientsEn: string[] = this.getEmailRecipientsByLanguage(selectedRecipients, "en");
        const recipientsSv: string[] = this.getEmailRecipientsByLanguage(selectedRecipients, "sv");
        const recipientsFi: string[] = this.getEmailRecipientsByLanguage(selectedRecipients, "fi");

        const totalAmount = recipientsEn.length + recipientsSv.length + recipientsFi.length;

        if (announcementData.dryRun) {
            return totalAmount.toString();
        }

        if (totalAmount === 0) {
            throw new BadRequestException(content.RecipientsNotFound);
        };

        const emails = [
            this.createEmailDataForLanguage(announcementData, recipientsEn, "en"),
            this.createEmailDataForLanguage(announcementData, recipientsSv, "sv"),
            this.createEmailDataForLanguage(announcementData, recipientsFi, "fi")
        ];

        this.logger.log(`User ${userId} is sending ${totalAmount} email messages.`);
        // The way email works we have no real idea whether the messages have been sent or not, as a message might bounce hours after
        // delivery attempt. Therefore we just always say emails sent and use the bounce address (configured in SES) to catch actual problems.
        // If there are other technical problems they are logged in the email service. If there are hundreds of emails to send we
        // aren't going to wait for them to finish anyway before acknowledging the frontend.
        emails.map(async (ea: EmailAnnouncement) => this.emailService.sendEmailsToUsers(ea, settings));

        return content.EmailAnnouncementSent;
    };
};
