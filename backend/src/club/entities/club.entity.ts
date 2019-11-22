import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Club {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    postCode: string;
}
