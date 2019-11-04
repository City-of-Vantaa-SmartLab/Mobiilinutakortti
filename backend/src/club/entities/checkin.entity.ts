import { Entity, PrimaryColumn, ManyToOne, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Club } from './club.entity';
import { Junior } from '../../junior/entities';

@Entity()
export class CheckIn {

    @PrimaryGeneratedColumn()
    id: string;

    @CreateDateColumn()
    timestamp: string;

    @ManyToOne(type => Club)
    club: Club;

    @ManyToOne(type => Junior, junior => junior.checkIns)
    junior: Junior;
}
