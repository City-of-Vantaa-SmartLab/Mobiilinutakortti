import { InternalServerErrorException, Logger } from '@nestjs/common'
import { SmsSettings } from './models'
import * as content from '../content'
import { ConfigHandler } from '../configHandler'

export class SMSConfig {
    /**
     * A method that returns SMS settings, or throws an error if they do not exist.
    *
    * @returns SmsSettings
    */
   public static getSmsConfig(): SmsSettings {
        const logger = new Logger('SMS confighandler')

        if (ConfigHandler.useMockSms()) {
            return {
                username: 'mock-user',
                password: 'mock-password',
                sender: 'MockSender',
                endPoint: 'http://localhost/mock-sms/send',
                batchEndPoint: 'http://localhost/mock-sms/batch',
            }
        }

        const username = process.env.SMS_USERNAME
        const password = process.env.SMS_PASSWORD
        const sender = process.env.SMS_SENDER
        const endPoint = process.env.SMS_ENDPOINT || 'https://ws.mkv.telia.fi/restsms/lekabrest/send'
        const batchEndPoint = process.env.SMS_BATCH_ENDPOINT || 'https://ws.mkv.telia.fi/restsms/lekabrest/batchsend/json'

        if (!username || !password || !sender || !endPoint || !batchEndPoint) {
            logger.error("Unable to find SMS config")
            throw new InternalServerErrorException(content.SmsServiceNotAvailable)
        }

        const config = {
            username,
            password,
            sender,
            endPoint,
            batchEndPoint,
        } as SmsSettings

        return config
    }
}
