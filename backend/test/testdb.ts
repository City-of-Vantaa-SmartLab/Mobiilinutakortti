import { DataSource } from 'typeorm';
import { newDb, DataType } from 'pg-mem';
import { randomUUID } from 'crypto';
import { join } from 'path';

export function getTestDB(): DataSource {
    const db = newDb();
    db.public.registerFunction({
        name: 'version',
        args: [],
        returns: DataType.text,
        implementation: () => 'PostgreSQL 16.0',
    });
    db.public.registerFunction({
        name: 'current_database',
        args: [],
        returns: DataType.text,
        implementation: () => 'test',
    });
    db.public.registerFunction({
        name: 'uuid_generate_v4',
        args: [],
        returns: DataType.uuid,
        impure: true,
        implementation: () => randomUUID(),
    });
    db.public.registerFunction({
        name: 'gen_random_uuid',
        args: [],
        returns: DataType.uuid,
        impure: true,
        implementation: () => randomUUID(),
    });

    return db.adapters.createTypeormDataSource({
        type: 'postgres',
        entities: [join(__dirname, '../src/**/*.entity{.ts,.js}')],
        synchronize: true,
    });
}
