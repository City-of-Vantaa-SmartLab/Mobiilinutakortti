import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsPhoneNumber, Length } from 'class-validator';
import { makePhoneNumberInternational, lowercase, trimString } from '../../common/transformers';
import { CheckIn } from '../../club/entities';
import { ConfigHelper } from '../../configHandler';

@Entity()
export class Junior {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ transformer: trimString })
    firstName: string;

    @Column({ transformer: trimString })
    lastName: string;

    @Column({ default: '', transformer: trimString })
    nickName: string;

    @IsPhoneNumber('FI')
    @Column({ unique: true, transformer: makePhoneNumberInternational })
    phoneNumber: string;

    @Column()
    postCode: string;

    @Column()
    school: string;

    @Column()
    class: string;

    @Column()
    parentsName: string;

    @IsPhoneNumber('FI')
    @Column({ transformer: makePhoneNumberInternational })
    parentsPhoneNumber: string;

    @Column({ transformer: lowercase })
    @Length(1, 1)
    gender: string;

    // Additional check introduced to allow the SQLite testDB to run
    @Column({ type: 'date', default: ConfigHelper.isTest() ? new Date().toLocaleDateString() : new Date(), nullable: true })
    birthday: string;

    @Column()
    homeYouthClub: string;

    @Column()
    status: string;

    @Column()
    photoPermission: boolean; 

    @OneToMany(type => CheckIn, checkIn => checkIn.junior, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    checkIns: CheckIn[];
}
