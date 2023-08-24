import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Messages } from '../classes/messages';


@Entity()
export class Club {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    postCode: string;

    @Column({ default: true })
    active: boolean;

    @Column(() => Messages)
    messages: Messages;
}
