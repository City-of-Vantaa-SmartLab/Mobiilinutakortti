import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Challenge {
    @PrimaryColumn()
    @Column({ unique: true })
    id: string;

    @Column()
    challenge: string;
}
