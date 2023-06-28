import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ExtraEntryType {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    expiryAge: number;
}
