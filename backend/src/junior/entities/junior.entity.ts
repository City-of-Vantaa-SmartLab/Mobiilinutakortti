import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Length } from 'class-validator';
import { makePhoneNumberInternational, lowercase, trimString } from '../../common/transformers';
import { CheckIn } from '../../club/entities';
import { ConfigHandler } from '../../configHandler';
import { NumberTransformer } from 'src/common/helpers';
import { ExtraEntry, Permit } from 'src/extraEntry/entities';

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
    @Column({ type: 'date', default: ConfigHandler.isTest() ? new Date().toLocaleDateString() : new Date(), nullable: true })
    birthday: string;

    // For historical reasons, type is character varying and not integer and needs to be transformed back into number for UI.
    @Column({ type: 'character varying', transformer: new NumberTransformer(), nullable: true  })
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

    @OneToMany(() => ExtraEntry, extraEntry => extraEntry.junior)
    extraEntries: ExtraEntry[];

    @OneToMany(() => Permit, permit => permit.junior)
    permits: Permit[];
}
