import { Connection, createConnection } from 'typeorm';

export async function getTestDB(): Promise<Connection> {
    return await createConnection({
        type: 'sqlite',
        database: 'test/testdb.sql',
        entities: ['src/**/*.entity{.ts,.js}'],
        synchronize: true,
    });
}
