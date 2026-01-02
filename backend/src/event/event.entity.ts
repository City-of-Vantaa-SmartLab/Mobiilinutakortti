import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { KompassiIntegration } from '../kompassi/kompassiIntegration.entity';

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true  })
    description: string;

    @Column({ nullable: true  })
    startDate: Date;

    @OneToOne(() => KompassiIntegration, kompassiIntegration => kompassiIntegration.club, { cascade: true })
    kompassiIntegration: KompassiIntegration
}
