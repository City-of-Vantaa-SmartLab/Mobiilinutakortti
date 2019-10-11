import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsPhoneNumber } from 'class-validator';

@Entity()
export class Junior {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    pin: string;

    @IsPhoneNumber('FI')
    @Column({ unique: true })
    phoneNumber: string;
}
