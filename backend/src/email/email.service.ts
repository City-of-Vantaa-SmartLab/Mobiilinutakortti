import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { EmailAnnouncement, EmailData } from './models/emailModels.model';
import { EmailSettings } from './models/emailSettings.model';
import { EmailConfig } from './emailConfigHandler';

@Injectable()
export class EmailService {

    private readonly logger = new Logger('Email Service');

    constructor() { }

    // NB: on one hand it would be kind of nice to send a single message to N recipients at a time.
    // On the other hand this caused problems in practice. For example Google Mail refused to receive
    // messages if too many people received the message with the same Message-ID.
    // Therefore we will always sent the message to each recipient separately using the To field and not Bcc.
    private getMessages(announcement: EmailAnnouncement, settings: EmailSettings): EmailData[] {
        const messages = new Array<EmailData>;
        for (const recipient of announcement.to) {
            messages.push({
                Source: settings.source,
                Destination: {
                    ToAddresses: [recipient]
                },
                Message: {
                    Subject: {
                        Data: announcement.title
                    },
                    Body: {
                        Text: {
                            Data: announcement.message
                        },
                    },
                },
                ReturnPath: settings.returnPath
            });
        }
        return messages;
    }

    async sendEmailsToUsers(announcement: EmailAnnouncement, settings: EmailSettings): Promise<void> {
        if (announcement.to.length < 1) return;

        const sesSettings = EmailConfig.getSesConfig();
        const client = new SESClient(sesSettings);
        const messages = this.getMessages(announcement, settings);

        for (const message of messages) {
            const command = new SendEmailCommand(message);
            client.send(command).then(response => {
                const { httpStatusCode, requestId } = response.$metadata;
                if ((httpStatusCode >= 200) && (httpStatusCode < 300)) {
                    this.logger.log(`Request ${requestId} OK`);
                } else {
                    this.logger.log(`Request ${requestId} failed with code: ${httpStatusCode}`);
                };
            }).catch((error) => {
                this.logger.log('Email error: ', error);
            });
        }
    }
};
