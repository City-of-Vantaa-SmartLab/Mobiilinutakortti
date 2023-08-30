import { AnnouncementLanguageVersions } from './announcementLanguageVersions';

export class AnnouncementData {
    content: AnnouncementLanguageVersions;
    title: AnnouncementLanguageVersions;
    msgType: string;
    recipient: string;
    youthClub: number | null;
    dryRun: boolean | null;
}
