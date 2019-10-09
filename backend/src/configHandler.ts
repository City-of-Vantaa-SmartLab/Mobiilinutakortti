import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class ConfigHelper {

    private static isLive() {
        return process.env.NODE_ENV === 'production';
    }

    static getJWTSecret(): string {
        return this.isLive() ? process.env.JWT : 'Remember to make me more secure before prod!';
    }

    static getDatabaseConnection(): TypeOrmModuleOptions {
        let dbOptions: TypeOrmModuleOptions;
        if (this.isLive()) {
            dbOptions = {
                type: 'postgres',
                host: process.env.RDS_HOSTNAME,
                port: +process.env.RDS_PORT,
                username: process.env.RDS_USERNAME,
                password: process.env.RDS_PASSWORD,
                database: 'vantaa-pwa',
                entities: ['dist/**/*.entity{.ts,.js}'],
                synchronize: true,
            };
        } else {
            dbOptions = {
                type: 'postgres',
                host: 'db',
                port: 5432,
                username: 'postgres',
                password: 'password',
                database: 'nuta',
                entities: ['dist/**/*.entity{.ts,.js}'],
                synchronize: true,
            };
        }
        return dbOptions;
    }
}