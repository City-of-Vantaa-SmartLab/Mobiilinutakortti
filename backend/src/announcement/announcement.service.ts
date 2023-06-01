import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClubService } from '../club/club.service';
import { JuniorService } from '../junior/junior.service';
import * as content from '../content';
import { AnnouncementData } from './classes/announcementData';
import { SmsService } from 'src/sms/sms.service';
import { BatchItem, TeliaBatchMessageRequest } from 'src/sms/models';
import { SMSConfig } from 'src/sms/smsConfigHandler';
import { AnnouncementContent } from './classes/announcementContent';
import { Junior } from 'src/junior/entities';


@Injectable()
export class AnnouncementService {

    constructor(
        private readonly clubService: ClubService,
        private readonly smsService: SmsService,
        private readonly juniorService: JuniorService
        ) { }

    getAnnouncementWithLanguage(content: AnnouncementContent, langCode: string): string  {
        const contentWithLangOrDefault = content[langCode] || content.fi;
        return contentWithLangOrDefault;
    };

    async clubAnnouncement(announcementData: AnnouncementData) {
        const settings = SMSConfig.getTeliaConfig();
        if (!settings) {
            throw new InternalServerErrorException(content.MessengerServiceNotAvailable);
        };

        const twoWeeksInSeconds = 1209600;
        const checkIns = await this.clubService.getCheckins({clubId: announcementData.youthClub, date: new Date().toString()}, twoWeeksInSeconds);
        const checkedInJuniors: Junior[] = checkIns.map((checkIn) => {
            return checkIn.junior;
        });

        const juniorsByHomeClub: Junior[] = await this.juniorService.getJuniorsByHomeYouthClub(announcementData.youthClub);
        const allRecipients = checkedInJuniors.concat(juniorsByHomeClub);
        // Create a typescript Set from recipients to eliminate double values
        const uniqueRecipients = new Set<Junior>(allRecipients);
        const selectedRecipients = Array.from(uniqueRecipients);

        const batch: BatchItem[] = announcementData.recipient === "parents" ? 
            selectedRecipients.filter((recipient) => recipient.smsPermissionParent)
            .filter((recipient) => recipient.parentsPhoneNumber.substring(0, 6) !== "358999")
            .map((recipient) => ({
                t: recipient.parentsPhoneNumber,
                m: this.getAnnouncementWithLanguage(announcementData.content, recipient.communicationsLanguage),
            })
        ) : selectedRecipients.filter((recipient) => recipient.smsPermissionJunior)
            .filter((recipient) => recipient.phoneNumber.substring(0, 6) !== "358999")
            .map((recipient) => ({
                t: recipient.phoneNumber,
                m: this.getAnnouncementWithLanguage(announcementData.content, recipient.communicationsLanguage),
            })
        );
        
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
            return true;
        } else {
            throw new InternalServerErrorException(content.MessengerServiceNotAvailable);
        }
    };
};
