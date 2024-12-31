import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Club } from './club.entity';
import { Junior } from '../../junior/entities';
import { ConfigHandler } from '../../configHandler';

@Entity()
export class CheckIn {

    @PrimaryGeneratedColumn()
    id: string;

    // Additional check introduced to allow testDB to run (for npm run test): SQLite doesn't have a date data type.
    @Column(
        ConfigHandler.isTest() ?
        { type: 'date', default: new Date().toLocaleDateString(), nullable: true } :
        { type: 'timestamp with time zone', default: new Date(), nullable: true }
    )
    checkInTime: Date;

    @ManyToOne(() => Club)
    club: Club;

    @ManyToOne(() => Junior, junior => junior.checkIns, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    junior: Junior;
}
