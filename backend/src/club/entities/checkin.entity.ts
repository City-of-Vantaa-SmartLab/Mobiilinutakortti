import { Entity, PrimaryColumn, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Club } from './club.entity';
import { Junior } from '../../junior/entities';
import { timeStampToDateTime } from '../../common/transformers';

@Entity()
export class CheckIn {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({ transformer: timeStampToDateTime })
    timestamp: string;

    @ManyToOne(type => Club)
    club: Club;

    @ManyToOne(type => Junior, junior => junior.checkIns)
    junior: Junior;
}
