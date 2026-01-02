import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Club } from '../club/entities';

@Entity()
export class KompassiIntegration {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Club, club => club.kompassiIntegration, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn()
    club: Club;

    @Column({ nullable: false, default: false })
    enabled: boolean;

    // Kompassi group id. Mandatory if using Kompassi integration.
    @Column({ nullable: true })
    groupId: number;

    // Kompassi activity type ids as comma separated list. Optional.
    @Column({ nullable: true })
    activityTypeIds: string;

    // Title prefix for Kompassi activity. Optional. The title by default is the date (when creating activity to Kompassi), this is a prefix for it. E.g. "Nuta-ilta" here would result in "Nuta-ilta 18.9.2024".
    @Column({ nullable: true })
    activityTitle: string;
}
