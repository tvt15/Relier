import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, JoinTable } from "typeorm";
import { User } from "./User";
import { Channel } from "./Channel";


@Entity()
export class Message {

    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @ManyToOne(() => User, {
        cascade: true
    })
    sender: User;

    @ManyToOne(() => Channel, {
        cascade: true
    })
    channel: Channel;

    @Column()
    text: string;

    @Column()
    is_vc: boolean;

    @Column({ type: 'timestamp', name: 'timestamp' })
    timestamp: Date;
}