import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ExtraEntryType {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    expiryAge: number;
}
