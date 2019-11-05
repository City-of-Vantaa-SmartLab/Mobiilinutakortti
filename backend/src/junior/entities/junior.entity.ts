import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsPhoneNumber, Length } from 'class-validator';
import { makePhoneNumberInternational } from '../../common/transformers';
import { CheckIn } from '../../club/entities';

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

    @Column({ default: '1230768000000', nullable: true })
    birthdayTimestamp: string;

    @Column()
    homeYouthClub: string;

    @OneToMany(type => CheckIn, checkIn => checkIn.junior, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    checkIns: CheckIn[];
}
