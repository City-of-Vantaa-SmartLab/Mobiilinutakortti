import { Entity, OneToOne, JoinColumn } from 'typeorm';
import { Admin } from './admin.entity';

@Entity()
export class Lockout {

    @OneToOne(type => Admin, { primary: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id' })
    id: Admin;

    attempts: number;

    expiry: string;
}
