import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
