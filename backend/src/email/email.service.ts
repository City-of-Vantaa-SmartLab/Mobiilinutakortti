import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { EmailBatchItem, EmailContentConfig } from './models/emailModels.model';
import { EmailSettings } from './models/emailSettings.model';
import { EmailConfig } from './emailConfigHandler';

@Injectable()
export class EmailService {
    
    private readonly logger = new Logger('Email Service');
    
    constructor(
        ) { }

        private getMessageInput(batchItem: EmailBatchItem, settings: EmailSettings): EmailContentConfig {
            const messageInput = {
                Source: settings.source,
                Destination: {
                    BccAddresses: batchItem.to,
                },
                Message: { 
                    Subject: {
                        Data: batchItem.title,
                    },
                    Body: {
                        Text: {
                        Data: batchItem.message,
                        },
                    },
                },
                ReturnPath: settings.returnPath
            };
            return messageInput;
        }
        
        async batchSendEmailsToUsers(batch: EmailBatchItem, settings: EmailSettings): Promise<boolean> {
            if (batch.to.length < 1) return;
            if (batch.to.length >= 1) {
                this.logger.log(`Batch sending ${batch.to.length} emails.`);
            };

            const sesSettings = EmailConfig.getSesConfig();
            const client = new SESClient(sesSettings);
            const messageInput = this.getMessageInput(batch, settings);
            const command = new SendEmailCommand(messageInput);

            return await client.send(command).then(
                response => {
                    const { httpStatusCode, requestId } = response.$metadata;
                    if ((httpStatusCode >= 200) && (httpStatusCode < 300)) {
                        this.logger.log(`Batch with requestId ${requestId} received successfully`);
                        return true;
                    } else {
                        this.logger.log(`Batch with requestId ${requestId} failed, code ${httpStatusCode}`);
                        return false;
                    };
            }).catch((error) => {
                this.logger.log('Email error: ', error);
                return false;
            });
    }
};
