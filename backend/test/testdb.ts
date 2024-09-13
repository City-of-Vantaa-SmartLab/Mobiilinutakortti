import { DataSource } from 'typeorm';

export function getTestDB(): DataSource {
    return new DataSource({
        type: 'sqlite',
        database: 'test/testdb.sql',
        entities: ['src/**/*.entity{.ts,.js}'],
        synchronize: true,
    });
}
