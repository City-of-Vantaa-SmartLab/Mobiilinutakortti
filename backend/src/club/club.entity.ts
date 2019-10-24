import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Club {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column()
    postCode: string;
}
