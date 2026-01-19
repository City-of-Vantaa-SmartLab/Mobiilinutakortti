import { BadRequestException, Logger } from '@nestjs/common';
import { SesSettings, EmailSettings } from "./emailSettings.interfaces";
import * as content from '../content';

export class EmailConfig {
    /**
     * A method that returns email settings, or undefined if they do not exist.
     *
     * @returns EmailSettings
     */

    public static getEmailConfig(): EmailSettings {
        const logger = new Logger('Email confighandler');

        const source = process.env.EMAIL_SOURCE;
        const returnPath = process.env.EMAIL_RETURN_PATH;

        if (!source || !returnPath ) {
            logger.error("Unable to find email config");
            throw new BadRequestException(content.EmailServiceNotAvailable);
        };

        const config = {
            source,
            returnPath
        } as EmailSettings;

        return config;
    }

    /**
     * A method that returns AWS SES settings, or undefined if they do not exist.
     *
     * @returns SesSettings
     */

    public static getSesConfig(): SesSettings {
        const logger = new Logger('SES confighandler');

        const accessKeyId = process.env.AWS_SES_KEY_ID;
        const secretAccessKey = process.env.AWS_SES_KEY_VALUE;
        const region = process.env.AWS_SES_REGION;

        if (!accessKeyId || !secretAccessKey || !region ) {
            logger.error("Unable to find SES config");
            throw new BadRequestException(content.EmailServiceNotAvailable);
        };

        const config = {
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            region,
        } as SesSettings;

        return config;
    };
};
