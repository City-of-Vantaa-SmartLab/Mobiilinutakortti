import { Entity, ManyToOne, PrimaryGeneratedColumn, Column, type Relation } from 'typeorm'
import { Club } from '../club/entities/club.entity'
import { Junior } from '../junior/entities'
import { Event } from '../event/event.entity'

@Entity()
export class CheckIn {

    @PrimaryGeneratedColumn()
    id!: string

    @Column({ type: 'timestamp with time zone', default: new Date(), nullable: true })
    checkInTime!: Date

    @ManyToOne(() => Club, { nullable: true })
    club!: Relation<Club> | null

    @ManyToOne(() => Event, { nullable: true })
    event!: Relation<Event> | null

    @ManyToOne(() => Junior, junior => junior.checkIns, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    junior!: Relation<Junior>
}
