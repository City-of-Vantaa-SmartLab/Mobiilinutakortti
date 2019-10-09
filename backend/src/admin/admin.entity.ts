import { Entity, PrimaryGeneratedColumn, Column, ValueTransformer } from 'typeorm';
import { IsEmail } from 'class-validator';
import { lowercase } from '../../common/Transformers';

@Entity()
export class Admin {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    password: string;

    @IsEmail()
    @Column({ unique: true, transformer: lowercase })
    email: string;
}
