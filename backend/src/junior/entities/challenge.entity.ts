import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Junior } from './junior.entity';

@Entity()
export class Challenge {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(type => Junior, { onDelete: 'CASCADE' })
    @JoinColumn()
    junior: Junior;

    @Column()
    challenge: string;
}
