import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Club } from './club.entity';
import { Junior } from '../../junior/entities';
import { ConfigHelper } from '../../configHandler';

@Entity()
export class CheckIn {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({
        type: ConfigHelper.isTest() ? 'text' : 'timestamp with time zone',
        default: getDefaultDate(),
    })
    timestamp: string;

    @ManyToOne(type => Club)
    club: Club;

    @ManyToOne(type => Junior, junior => junior.checkIns)
    junior: Junior;
}

function getDefaultDate() {
    const currentTime = new Date();
    return ConfigHelper.isTest() ? currentTime.getTime() : currentTime;
}
