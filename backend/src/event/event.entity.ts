import { EntryType } from 'src/extraEntry/entities';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true  })
    description: string;

    @Column({ nullable: true  })
    startDate: Date;

    @Column({ nullable: true  })
    integrationId: number;

    @OneToOne(_ => EntryType, { cascade: true, nullable: true })
    @JoinColumn()
    permit: EntryType;
}
