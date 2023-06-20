import { Column } from 'typeorm';

export class AnnouncementLanguageVersions {
    @Column()
    fi: string;

    @Column({ nullable: true })
    en: string;

    @Column({ nullable: true })
    sv: string;
}
