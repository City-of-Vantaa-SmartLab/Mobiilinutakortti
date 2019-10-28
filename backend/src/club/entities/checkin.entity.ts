import { Entity, PrimaryColumn, ManyToMany, JoinTable } from 'typeorm';
import { Club } from './club.entity';
import { Junior } from 'src/junior/entities';

@Entity()
export class CheckIn {

    @PrimaryColumn()
    dayTimeStamp: string;

    @PrimaryColumn()
    club: Club;

    @ManyToMany(type => Junior, junior => junior.id)
    @JoinTable()
    juniors: Junior[];
}
