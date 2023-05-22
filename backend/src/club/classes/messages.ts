import { Column } from 'typeorm';


export class Messages {
    @Column({ nullable: true })
    fi: string;

    @Column({ nullable: true })
    en: string;

    @Column({ nullable: true })
    sv: string;
}
