import { SesSettings, EmailSettings } from "./models/emailSettings.model";

export class EmailConfig {
    /**
     * A method that returns email settings, or undefined if they do not exist.
     *
     * @returns EmailSettings
     */

    public static getEmailConfig(): EmailSettings {
        const src = process.env.EMAIL_SOURCE;
        const returnPath = process.env.RETURN_PATH;
        const config = {
            source: src,
            returnPath: returnPath
        } as EmailSettings;
        return src && returnPath ? config : undefined;
    }

    /**
     * A method that returns AWS SES settings, or undefined if they do not exist.
     *
     * @returns SesSettings
     */
    public static getSesConfig(): SesSettings {
        const config = {
            credentials: {
                accessKeyId: process.env.AWS_SES_KEY_ID,
                secretAccessKey: process.env.AWS_SES_KEY_VALUE,  
            },
            region: process.env.AWS_SES_REGION,
        } as SesSettings;
        return this.checkSettings(config);
    }

    /**
     * A method that checks the aws email settings returning null if there is data missing.
     *
     * @returns SesSettings
     */
    private static checkSettings(config: SesSettings): SesSettings {
        if (Object.values(config).every(Boolean)) {
            return config;
        }
        return undefined;
    }
}
