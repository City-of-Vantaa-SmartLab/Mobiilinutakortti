import { Junior } from 'src/junior/entities';
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ExtraEntryType } from './extraEntryType.entity';

@Entity()
export class ExtraEntry {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Junior, junior => junior.extraEntries)
    junior: Junior;

    @ManyToOne(() => ExtraEntryType)
    extraEntryType: ExtraEntryType;
}
