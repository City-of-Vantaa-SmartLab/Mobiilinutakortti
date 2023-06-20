import { BadRequestException, Logger } from '@nestjs/common';
import { TeliaSettings } from './models';
import * as content from '../content';

export class SMSConfig {
    /**
     * A method that returns the telia settings, or undefined if they do not exist.
    *
    * @returns TeliaSettings
    */
   
   public static getTeliaConfig(): TeliaSettings {
        const logger = new Logger('SMS confighandler');

        const username = process.env.TELIA_USERNAME;
        const password = process.env.TELIA_PASSWORD;
        const user = process.env.TELIA_USER;
        const endPoint = process.env.TELIA_ENDPOINT || 'https://ws.mkv.telia.fi/restsms/lekabrest/send';
        const batchEndPoint = process.env.TELIA_BATCH_ENDPOINT || 'https://ws.mkv.telia.fi/restsms/lekabrest/batchsend/json';
        
        if (!username || !password || !user || !endPoint || !batchEndPoint) {
            logger.error("Unable to find Telia config");
            throw new BadRequestException(content.SmsServiceNotAvailable);
        };

        const config = {
            username,
            password,
            user,
            endPoint,
            batchEndPoint,
        } as TeliaSettings;

        return config;
    }
}
