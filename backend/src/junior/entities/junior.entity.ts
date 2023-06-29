import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Length } from 'class-validator';
import { makePhoneNumberInternational, lowercase, trimString } from '../../common/transformers';
import { CheckIn } from '../../club/entities';
import { ConfigHelper } from '../../configHandler';
import { STATUS } from '../enum/status.enum';

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

    @Column({ unique: true, transformer: makePhoneNumberInternational })
    phoneNumber: string;

    @Column({ default: false })
    smsPermissionJunior: boolean;

    @Column()
    postCode: string;

    @Column()
    school: string;

    @Column()
    class: string;

    @Column()
    parentsName: string;

    @Column({ transformer: makePhoneNumberInternational })
    parentsPhoneNumber: string;

    @Column({ default: false })
    smsPermissionParent: boolean;

    @Column({ nullable: true  })
    parentsEmail: string;

    @Column({ default: false })
    emailPermissionParent: boolean;

    @Column({ nullable: true  })
    additionalContactInformation: string;

    @Column({ transformer: lowercase })
    @Length(1, 1)
    gender: string;

    // Additional check introduced to allow testDB to run (for npm run test): SQLite doesn't have a date data type.
    @Column({ type: 'date', default: ConfigHelper.isTest() ? new Date().toLocaleDateString() : new Date(), nullable: true })
    birthday: string;

    @Column()
    homeYouthClub: string;

    @Column({ default: 'fi' })
    communicationsLanguage: string;

    @Column({ type: 'enum', enum: STATUS, default: STATUS.PENDING })
    status: STATUS;

    // See testDB note above.
    @Column({ type: 'date', default: ConfigHelper.isTest() ? new Date().toLocaleDateString() : new Date(), nullable: true })
    creationDate: string;

    @Column()
    photoPermission: boolean;

    @OneToMany(type => CheckIn, checkIn => checkIn.junior, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    checkIns: CheckIn[];
}
