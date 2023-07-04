import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Club } from './club.entity';
import { Junior } from '../../junior/entities';

@Entity()
export class CheckIn {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({ type: 'timestamp with time zone' })
    checkInTime: Date;

    @ManyToOne(() => Club)
    club: Club;

    @ManyToOne(() => Junior, junior => junior.checkIns, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    junior: Junior;
}
