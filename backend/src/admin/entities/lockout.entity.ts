import { Entity, OneToOne, JoinColumn, Column } from 'typeorm';
import { Admin } from './admin.entity';
import { ConfigHelper } from '../../configHandler';

@Entity()
export class Lockout {

    @OneToOne(type => Admin, { primary: true, onDelete: 'CASCADE' })
    @JoinColumn()
    admin: Admin;

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
