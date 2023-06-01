import { Column } from 'typeorm';
import { AnnouncementContent } from './announcementContent';

export class AnnouncementData {
    @Column()
    content: AnnouncementContent;

    @Column()
    recipient: string;

    @Column()
    youthClub: string;
}
