import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsPhoneNumber, Length, IsPositive } from 'class-validator';
import { jsonDataToNumber } from '../../common/transformers';

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

    @Column()
    postCode: string;

    @Column()
    parentsName: string;

    @IsPhoneNumber('FI')
    @Column()
    parentsPhoneNumber: string;

    @Column()
    @Length(1, 1)
    gender: string;

    @Column({ transformer: jsonDataToNumber })
    @IsPositive()
    age: number;

    @Column()
    homeYouthClub: string;
}
