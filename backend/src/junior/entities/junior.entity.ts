import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { IsPhoneNumber } from 'class-validator';

@Entity()
export class Junior {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @IsPhoneNumber('FI')
    @Column({ unique: true })
    phoneNumber: string;
}
