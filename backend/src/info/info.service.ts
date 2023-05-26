import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Challenge } from '../junior/entities';
import { ClubService } from '../club/club.service';
import * as content from '../content';
import { ConfigHelper } from '../configHandler';
import moment = require('moment');
import { InfoMessageData } from './classes/infoMessageData';
import { SmsService } from 'src/sms/sms.service';
import { TeliaMessageRequest } from 'src/sms/models';
import { SMSConfig } from 'src/sms/smsConfigHandler';


@Injectable()
export class InfoService {

    private readonly logger = new Logger('SMS Service');

    constructor(
        private readonly clubService: ClubService,
        private readonly smsService: SmsService,
        ) { }

    async sendMessageToClub(messageData: InfoMessageData): Promise<boolean> {
         console.log('messageData', messageData)
         return
        // const settings = SMSConfig.getTeliaConfig();
        // if (!settings) {
        //     throw new InternalServerErrorException(content.MessengerServiceNotAvailable);
        // }

        // const recipients = messageData.recipient

        // const messageRequest = {
        //     username: settings.username, password: settings.password,
        //     from: settings.user, to: [recipients], message: messageData.msgContent,
        // } as TeliaMessageRequest;
        // const attemptMessage = await this.smsService.sendMessageToUser(messageRequest, settings.endPoint);
        // if (attemptMessage) {
        //     return true;
        // } else {
        //     throw new InternalServerErrorException(content.MessengerServiceNotAvailable);
        // }
    }
}
