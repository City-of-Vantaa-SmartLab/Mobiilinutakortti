import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClubService } from '../club/club.service';
import { JuniorService } from '../junior/junior.service';
import * as content from '../content';
import { AnnouncementData } from './classes/announcementData';
import { SmsService } from 'src/sms/sms.service';
import { BatchItem, TeliaBatchMessageRequest } from 'src/sms/models';
import { SMSConfig } from 'src/sms/smsConfigHandler';
import { EmailConfig } from 'src/email/emailConfigHandler';
import { AnnouncementLanguageVersions } from './classes/announcementLanguageVersions';
import { Junior } from 'src/junior/entities';
import { EmailService } from 'src/email/email.service';
import { EmailBatchItem } from 'src/email/models/emailModels.model';

@Injectable()
export class AnnouncementService {

    constructor(
        private readonly clubService: ClubService,
        private readonly smsService: SmsService,
        private readonly emailService: EmailService,
        private readonly juniorService: JuniorService
        ) { }

    private getAnnouncementWithLanguage(content: AnnouncementLanguageVersions, langCode: string): string  {
        const contentWithLangOrDefault = content[langCode] || content.fi;
        return contentWithLangOrDefault;
    };

    private async getSelectedRecipients(youthClub: string): Promise<Junior[]> {
        const twoWeeksInSeconds = 1209600;
        const checkIns = await this.clubService.getCheckins({clubId: youthClub, date: new Date().toString()}, twoWeeksInSeconds);
        const checkedInJuniors = checkIns.map((checkIn) => {
            return checkIn.junior;
        });

        const juniorsByHomeClub = await this.juniorService.getJuniorsByHomeYouthClub(youthClub);
        const allRecipients = checkedInJuniors.concat(juniorsByHomeClub);
        const uniqueRecipients = new Set<Junior>(allRecipients);
        return Array.from(uniqueRecipients);
    }

    private async getAllForRecipients(): Promise<Junior[]> {
        const activeClubs = (await this.clubService.getClubs()).filter(club => club.active);
        const recipientsByClub = await Promise.all(activeClubs.map(async(club) =>  await this.getSelectedRecipients(club.id)));
        const recipients = recipientsByClub.reduce((a, b) => a.concat(b), []);
        return recipients;
    }

    private getEmailRecipientsByLanguage(recipients: Junior[], langCode: string): string[] {
        return recipients.filter((recipient) => recipient.communicationsLanguage === langCode)
                .filter((recipientWithLang) => recipientWithLang.emailPermissionParent)
                .map((allowedRecipient) => allowedRecipient.parentsEmail)
                .filter(email => /^\S+@\S+\.\S+$/.test(email));
    };

    private splitToBatches(recipientEmails: string[], batchSize: number): Array<string[]> {
        const batchArrays = []; 
        for (let i = 0; i < recipientEmails.length; i += batchSize)
            batchArrays.push(recipientEmails.slice(i, i + batchSize));
        return batchArrays;
    };

    private createEmailDataForLanguage(announcementData: AnnouncementData, recipients: Array<string[]>, lang: string): EmailBatchItem[] {
        return recipients.map(r => {
            return {
                to: r,
                title: announcementData.title[lang] || announcementData.title["fi"],
                message: announcementData.content[lang] || announcementData.content["fi"]
            };
        });
    };
    
    async clubAnnouncementSms(announcementData: AnnouncementData): Promise<string> {
        const settings = SMSConfig.getTeliaConfig();

        const youthClubId = announcementData.youthClub;
        const selectedRecipients = !youthClubId ? await this.getAllForRecipients() : await this.getSelectedRecipients(youthClubId);

        const parentBatch: BatchItem[] = announcementData.recipient.includes("parents") ?
            selectedRecipients.filter((recipient: Junior) => recipient.smsPermissionParent)
            .filter((recipient: Junior) => recipient.parentsPhoneNumber.substring(0, 6) !== "358999")
            .map((recipient: Junior) => ({
                t: recipient.parentsPhoneNumber,
                m: this.getAnnouncementWithLanguage(announcementData.content, recipient.communicationsLanguage),
            })
        ) : [];
        
        const juniorBatch: BatchItem[] = announcementData.recipient.includes("juniors") ?
            selectedRecipients.filter((recipient: Junior) => recipient.smsPermissionJunior)
                .filter((recipient: Junior) => recipient.phoneNumber.substring(0, 6) !== "358999")
                .map((recipient: Junior) => ({
                    t: recipient.phoneNumber,
                    m: this.getAnnouncementWithLanguage(announcementData.content, recipient.communicationsLanguage),
                })
        ) : [];

        const batch: BatchItem[] = parentBatch.concat(juniorBatch);

        if (batch.length < 1) {
            throw new BadRequestException(content.RecipientsNotFound); 
        };

        const messageRequest = {
            username: settings.username,
            password: settings.password,
            from: settings.user,
            batch,
        } as TeliaBatchMessageRequest;
        
        const attemptMessage = await this.smsService.batchSendMessagesToUsers(messageRequest, settings.batchEndPoint);
        if (attemptMessage) {
            return content.SmsBatchSent;
        } else {
            throw new InternalServerErrorException(content.SmsServiceNotAvailable);
        };
    };

    async clubAnnouncementEmail(announcementData: AnnouncementData): Promise<string> {
        const settings = EmailConfig.getEmailConfig();

        const youthClubId = announcementData.youthClub;
        const selectedRecipients = !youthClubId ? await this.getAllForRecipients() : await this.getSelectedRecipients(youthClubId);
        
        const recipientBatchesEn: Array<string[]> = this.splitToBatches(this.getEmailRecipientsByLanguage(selectedRecipients, "en"), 50);
        const recipientBatchesSv: Array<string[]> = this.splitToBatches(this.getEmailRecipientsByLanguage(selectedRecipients, "sv"), 50);
        const recipientBatchesFi: Array<string[]> = this.splitToBatches(this.getEmailRecipientsByLanguage(selectedRecipients, "fi"), 50);

        if ((recipientBatchesEn.length + recipientBatchesSv.length + recipientBatchesFi.length) === 0) {
            throw new BadRequestException(content.RecipientsNotFound);
        };

        const emails =
        this.createEmailDataForLanguage(announcementData, recipientBatchesEn, "en").concat(
        this.createEmailDataForLanguage(announcementData, recipientBatchesSv, "sv")).concat(
        this.createEmailDataForLanguage(announcementData, recipientBatchesFi, "fi"));
        
        const responses = Promise.all(emails.map(async (e) => {
            return await this.emailService.batchSendEmailsToUsers(e, settings)
        }));

        if ((await responses).reduce((x,y) => {return x && y}, true)) {
            return content.EmailBatchSent;
        } else {
            throw new InternalServerErrorException(content.EmailBatchFailed);
        };
    };
};
