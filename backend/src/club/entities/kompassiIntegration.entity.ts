import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Club } from 'src/club/entities';

@Entity()
export class KompassiIntegration {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Club, club => club.kompassiIntegration, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn()
    club: Club;

    @Column({ nullable: false, default: false })
    enabled: boolean;

    // Kompassi organisation id. Mandatory if using Kompassi integration.
    @Column({ nullable: true })
    organisationId: number;

    // Kompassi group id. Mandatory if using Kompassi integration.
    @Column({ nullable: true })
    groupId: number;

    // Kompassi activity type ids as comma separated list. Optional.
    @Column({ nullable: true })
    activityTypeIds: string;

    // Title for Kompassi activity. Optional. The name by default is the date, this is a prefix for it.
    @Column({ nullable: true, default: 'Nuta-ilta' })
    activityTitle: string;
}
