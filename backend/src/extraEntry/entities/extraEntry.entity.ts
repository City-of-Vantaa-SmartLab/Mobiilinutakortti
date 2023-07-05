import { Junior } from 'src/junior/entities';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { ExtraEntryType } from './extraEntryType.entity';

@Entity()
export class ExtraEntry {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Junior, junior => junior.extraEntries, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    junior: Junior;

    @ManyToOne(() => ExtraEntryType)
    extraEntryType: ExtraEntryType;
}
