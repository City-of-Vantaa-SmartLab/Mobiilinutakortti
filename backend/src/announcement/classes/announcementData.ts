import { Column } from 'typeorm';
import { AnnouncementLanguageVersions } from './announcementLanguageVersions';

export class AnnouncementData {
    @Column()
    content: AnnouncementLanguageVersions;

    @Column()
    title: AnnouncementLanguageVersions;

    @Column()
    msgType: string;

    @Column({nullable: true})
    recipient: string;

    @Column()
    youthClub: string;
}
