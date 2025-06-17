import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class EntryType {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    expiryAge: number;
}
