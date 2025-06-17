import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { EntryType } from './entryType.entity';
import { Junior } from '../../junior/entities';

@Entity()
export class EntryPermit {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Junior, junior => junior.entryPermits, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    junior: Junior;

    @ManyToOne(() => EntryType)
    entryType: EntryType;
}
