import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { Junior } from './junior.entity'

@Entity()
export class Challenge {

    @PrimaryGeneratedColumn('uuid')
    id!: string

    @OneToOne(_ => Junior, { onDelete: 'CASCADE' })
    @JoinColumn()
    junior!: Relation<Junior>

    @Column()
    challenge!: string
}
