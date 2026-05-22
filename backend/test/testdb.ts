import { DataSource } from 'typeorm';
import { newDb, DataType } from 'pg-mem';
import { randomUUID } from 'crypto';
import { join } from 'path';

// The functions defined here are features found in a real PostgreSQL database, but not supported by pg-mem by default.
export function getTestDB(): DataSource {
    const db = newDb();
    db.public.registerFunction({
        name: 'version',
        args: [],
        returns: DataType.text,
        implementation: () => 'PostgreSQL 18.0',
    });
    db.public.registerFunction({
        name: 'current_database',
        args: [],
        returns: DataType.text,
        implementation: () => 'test',
    });
    db.public.registerFunction({
        name: 'quote_ident',
        args: [DataType.text],
        returns: DataType.text,
        implementation: (input: string) => `"${String(input).replace(/"/g, '""')}"`,
    });
    db.public.registerFunction({
        name: 'obj_description',
        args: [DataType.text, DataType.text],
        returns: DataType.text,
        implementation: () => null,
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
        invalidWhereValuesBehavior: {
            null: 'ignore',
            undefined: 'ignore',
        },
    });
}
