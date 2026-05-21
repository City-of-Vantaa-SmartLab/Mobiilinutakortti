import { Entity, OneToOne, JoinColumn, Column, PrimaryColumn } from 'typeorm';
import { YouthWorker } from './youthWorker.entity';

@Entity()
export class Lockout {
    @PrimaryColumn()
    youthWorkerId!: string

    @OneToOne(_ => YouthWorker, { onDelete: 'CASCADE' })
    @JoinColumn()
    youthWorker!: YouthWorker;

    @Column({ default: 0 })
    attempts!: number;

    @Column({
        type: 'timestamp with time zone',
        default: getDefaultDate(),
    })
    expiry!: Date;
}

function getDefaultDate() {
    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours() + 3, currentTime.getMinutes());
    return currentTime;
}
