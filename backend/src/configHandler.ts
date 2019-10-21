import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class ConfigHelper {

    private static isLive() {
        return process.env.NODE_ENV === 'production';
    }

    static getJWTSecret(): string {
        return process.env.JWT || 'Remember to make me more secure before prod!';
    }

    static getDatabaseConnection(): TypeOrmModuleOptions {
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
        return process.env.FRONTEND || 'http://localhost:3001';
    }
}
