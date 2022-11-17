import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsEmail } from 'class-validator';
import { lowercase, jsonDataToBoolean } from '../../common/transformers';

/**
 * Entity model for Admin.
 */
@Entity()
export class Admin {

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

    @Column({ default: false, transformer: jsonDataToBoolean })
    isSuperUser: boolean;

    @Column({ default: '', nullable: true })
    mainYouthClub: string;

    @Column({ default: null, nullable: true })
    passwordLastChanged: Date;
}
