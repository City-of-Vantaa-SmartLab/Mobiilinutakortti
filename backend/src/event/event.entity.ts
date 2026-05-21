import { EntryType } from '../extraEntry/entities';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ type: 'varchar', nullable: true })
    description!: string | null;

    @Column({ type: 'timestamp with time zone', nullable: true })
    startDate!: Date | null;

    @Column({ type: 'int', nullable: true })
    integrationId!: number | null;

    @OneToOne(_ => EntryType, { cascade: true, nullable: true })
    @JoinColumn()
    permit!: EntryType | null;
}
