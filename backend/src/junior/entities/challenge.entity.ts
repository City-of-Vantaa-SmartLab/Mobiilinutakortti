import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Challenge {

    @PrimaryColumn({ unique: true })
    id: string;

    @Column()
    challenge: string;
}
