import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, JoinTable } from "typeorm";
import { User } from "./User";
import { Channel } from "./Channel";

@Entity()
export class Team {

    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'name' })
    name: string;

    @ManyToOne(() => User)
    owner: User;

    @ManyToMany(() => User, User => User.teams, {
        cascade: true
    })
    @JoinTable()
    members: User[];

    @ManyToMany(() => Channel, Channel => Channel.teams)
    channels: Channel[];

    @Column({ name: 'secret' })
    secret: string;

}