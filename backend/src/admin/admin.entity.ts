import { Entity, PrimaryGeneratedColumn, Column, ValueTransformer } from 'typeorm';
import { IsEmail } from 'class-validator';
import { lowercase, stringToBoolean } from '../common/transformers';

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

    @Column({ default: false, transformer: stringToBoolean })
    isSuperUser: boolean;
}
