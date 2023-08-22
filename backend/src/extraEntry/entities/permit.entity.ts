import { Junior } from 'src/junior/entities';
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ExtraEntryType } from './extraEntryType.entity';

@Entity()
export class Permit {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Junior, junior => junior.permits, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    junior: Junior;

    @ManyToOne(() => ExtraEntryType)
    permitType: ExtraEntryType;
}
