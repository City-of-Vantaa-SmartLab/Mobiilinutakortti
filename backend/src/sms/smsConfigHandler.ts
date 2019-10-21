import { TeliaSettings } from './models';

export class SMSConfig {

    /**
     * A method that returns the telia settings, or undefined if they do not exist.
     *
     * @returns TeliaSettings
     */
    public static getTeliaConfig(): TeliaSettings {
        const config = {
            username: process.env.TELIA_USERNAME,
            password: process.env.TELIA_PASSWORD,
            user: process.env.TELIA_USER,
            endPoint: process.env.TELIA_ENDPOINT || 'https://ws.mkv.telia.fi/restsms/lekabrest/send',
        } as TeliaSettings;
        return this.checkSettings(config);
    }

    /**
     * A method that checks the telia settings reutrning null if there is data missing.
     *
     * @returns TeliaSettings
     */
    private static checkSettings(config: TeliaSettings): TeliaSettings {
        if (config.username && config.user && config.password && config.endPoint) {
            return config;
        }
        return undefined;
    }
}
