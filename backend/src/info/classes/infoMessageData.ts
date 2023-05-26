import { Column } from 'typeorm';

export class InfoMessageData {
    @Column()
    msgContent: string;

    @Column()
    recipient: string;

    @Column()
    youthClub: string;
}
