import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Messages } from '../classes/messages';
import { KompassiIntegration } from '../../kompassi/kompassiIntegration.entity';

@Entity()
export class Club {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    postCode: string;

    @Column({ default: true })
    active: boolean;

    @Column(() => Messages)
    messages: Messages;

    @OneToOne(() => KompassiIntegration, kompassiIntegration => kompassiIntegration.club, { cascade: true })
    kompassiIntegration: KompassiIntegration
}
