import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, JoinTable } from "typeorm";
import { Message } from "./Message";
import { Team } from "./Team";
import { User } from "./User";

@Entity()
@Unique(['secret'])
export class Channel {

    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'name' })
    name: string;

    @ManyToMany(() => User, {
        cascade: true
    })
    @JoinTable()
    members: User[];

    @ManyToMany(() => Team, Team => Team.channels,{
        cascade:true
    })
    @JoinTable()
    teams: Team[];

    @Column({ name: 'secret' })
    secret: string;

}