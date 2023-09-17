import { Entity, Column, PrimaryGeneratedColumn, Unique, ManyToMany, JoinTable } from "typeorm";
import { Team } from "./Team";

@Entity()
@Unique(['email'])
export class User {

    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'name' })
    name: string;

    @Column({ name: 'email' })
    email: string;

    @Column({ name: 'password' })
    password: string;

    @ManyToMany(() => Team, Team => Team.members)
    teams: Team[];
}