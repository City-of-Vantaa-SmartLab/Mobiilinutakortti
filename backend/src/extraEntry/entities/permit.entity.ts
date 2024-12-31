import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ExtraEntryType } from './extraEntryType.entity';
import { Junior } from '../../junior/entities';

@Entity()
export class Permit {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Junior, junior => junior.permits, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    junior: Junior;

    @ManyToOne(() => ExtraEntryType)
    permitType: ExtraEntryType;
}
