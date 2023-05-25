import { Entity, OneToOne, JoinColumn, Column, PrimaryColumn } from 'typeorm';
import { YouthWorker } from './youthWorker.entity';
import { ConfigHelper } from '../../configHandler';

@Entity()
export class Lockout {
    @PrimaryColumn()
    youthWorkerId: string

    @OneToOne(type => YouthWorker, { onDelete: 'CASCADE' })
    @JoinColumn()
    youthWorker: YouthWorker;

    @Column({ default: 0 })
    attempts: number;

    @Column({
        type: ConfigHelper.isTest() ? 'text' : 'timestamp with time zone',
        default: getDefaultDate(),
    })
    expiry: string;
}

function getDefaultDate() {
    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours() + 3, currentTime.getMinutes());
    return ConfigHelper.isTest() ? currentTime.getTime() : currentTime;
}
