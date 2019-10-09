import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsPhoneNumber } from 'class-validator';

@Entity()
export class Junior {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    pin: string;

    // Todo: change to FI if needed depedant on SMS provider.
    @IsPhoneNumber(null)
    @Column({ unique: true })
    phoneNumber: string;
}
