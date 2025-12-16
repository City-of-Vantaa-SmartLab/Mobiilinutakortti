import { CheckIn } from '../../club/entities';
import { ConfigHandler } from '../../configHandler';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ExtraEntry, EntryPermit } from '../../extraEntry/entities';
import { Length } from 'class-validator';
import { standardizePhoneNumber, lowercase, trimString } from '../../common/transformers';

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

    @Column({ unique: true, transformer: standardizePhoneNumber })
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

    @Column({ transformer: standardizePhoneNumber })
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
    @Column({ type: 'date', default: ConfigHandler.isTest() ? new Date().toLocaleDateString() : new Date(), nullable: true })
    birthday: string;

    @Column({ nullable: true  })
    homeYouthClub: number;

    @Column({ default: 'fi' })
    communicationsLanguage: string;

    @Column()
    status: string;

    // See testDB note above.
    @Column({ type: 'date', default: ConfigHandler.isTest() ? new Date().toLocaleDateString() : new Date(), nullable: true })
    creationDate: string;

    @Column()
    photoPermission: boolean;

    @OneToMany(() => CheckIn, checkIn => checkIn.junior)
    checkIns: CheckIn[];

    // Extra entries are an optional feature to use the same registry of juniors for extra activities outside youth clubs, such as a permission to use a youth gym. See the environment variable REACT_APP_ENABLE_EXTRA_ENTRIES in the admin frontend.
    @OneToMany(() => ExtraEntry, extraEntry => extraEntry.junior)
    extraEntries: ExtraEntry[];

    // The permits are meant to work as an intermediate step towards an extra entry. For example, a junior could have a parent's permit to participate in an introductory gym course. After the course, they would have the extra entry itself, indicating they have permission to use the gym.
    @OneToMany(() => EntryPermit, permit => permit.junior)
    entryPermits: EntryPermit[];
}
