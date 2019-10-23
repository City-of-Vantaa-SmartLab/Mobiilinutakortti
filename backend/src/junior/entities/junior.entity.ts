import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsPhoneNumber, Length, IsPositive, IsMobilePhone } from 'class-validator';
import { jsonDataToNumber, makePhoneNumberInternational } from '../../common/transformers';

@Entity()
export class Junior {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @IsPhoneNumber('FI')
    @Column({ unique: true, transformer: makePhoneNumberInternational })
    phoneNumber: string;

    @Column()
    postCode: string;

    @Column()
    parentsName: string;

    @IsPhoneNumber('FI')
    @Column({ transformer: makePhoneNumberInternational })
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
