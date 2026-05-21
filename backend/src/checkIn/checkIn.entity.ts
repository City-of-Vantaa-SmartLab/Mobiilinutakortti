import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Club } from '../club/entities/club.entity';
import { Junior } from '../junior/entities';
import { Event } from '../event/event.entity';

@Entity()
export class CheckIn {

    @PrimaryGeneratedColumn()
    id!: string;

    @Column({ type: 'timestamp with time zone', default: new Date(), nullable: true })
    checkInTime!: Date;

    @ManyToOne(() => Club, { nullable: true })
    club!: Club | null;

    @ManyToOne(() => Event, { nullable: true })
    event!: Event | null;

    @ManyToOne(() => Junior, junior => junior.checkIns, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    junior!: Junior;
}
