import { Column } from 'typeorm';

export class AnnouncementContent {
    @Column()
    fi: string;

    @Column({ nullable: true })
    en: string;

    @Column({ nullable: true })
    sv: string;
}
