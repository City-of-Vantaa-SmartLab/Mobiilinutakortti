import { Logger } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';

interface KeyData {
    kid: string;
    x5c: string[];
}

export class ConfigHandler {

    private static readonly _logger = new Logger('ConfigHandler');
    private static _keyRefreshDay: Date = new Date();
    private static _keys: KeyData[] = [];
    private static _httpService = new HttpService();

    // Gets the public certificate from Entra ID service. The certificate has the public key.
    static async getPublicCert(kid: string): Promise<string | null> {
        // Refresh keys once a day.
        if (ConfigHandler._keys.length === 0 || ConfigHandler._keyRefreshDay.getDate() !== new Date().getDate()) {
            try {
                await ConfigHandler._httpService.get(process.env.ENTRA_APP_KEY_DISCOVERY_URL).toPromise().then(res => {
                    ConfigHandler._keys = (res.data as { keys: KeyData[] }).keys;
                });
                ConfigHandler._keyRefreshDay = new Date();
                ConfigHandler._logger.log('Entra ID keys updated.');
            } catch (error) {
                ConfigHandler._logger.error('Entra ID key fetching failed: ' + error);
            }
        }

        const key = ConfigHandler._keys.find(k => k.kid === kid);
        // Assume certificate is a root certificate (issued by accounts.accesscontrol.windows.net), so [0]
        return key ? '-----BEGIN CERTIFICATE-----\n' + key.x5c[0] + '\n-----END CERTIFICATE-----\n' : null;
    }

    static isTest() {
        return process.env.NODE_ENV === 'test';
    }

    static getTypeOrmModuleConfig(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: process.env.RDS_HOSTNAME || 'db',
            port: +process.env.RDS_PORT || 5432,
            username: process.env.RDS_USERNAME || 'postgres',
            password: process.env.RDS_PASSWORD || 'password',
            database: process.env.RDS_DB_NAME || 'nuta',
            entities: ['dist/**/*.entity{.ts,.js}'],
            synchronize: true,
        };
    }

    static getFrontendPort(): string {
        return process.env.FRONTEND_BASE_URL || 'http://localhost:3001';
    }

    static detailedLogs() {
        return !!process.env.DETAILED_LOGS;
    }
}
