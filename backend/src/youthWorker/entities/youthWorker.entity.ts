import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsEmail } from 'class-validator';
import { lowercase, jsonDataToBoolean } from '../../common/transformers';

/**
 * Entity model for youth worker.
 */
@Entity({name: 'admin'})
export class YouthWorker {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    password: string;

    @IsEmail()
    @Column({ unique: true, transformer: lowercase })
    email: string;

    @Column({ name: 'isSuperUser', default: false, transformer: jsonDataToBoolean })
    isAdmin: boolean;

    @Column({ nullable: true })
    mainYouthClub: number;

    @Column({ default: null, nullable: true })
    passwordLastChanged: Date;
}
