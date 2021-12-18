import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "team", schema: "public" })
export class TeamSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  name: string;

  @Column("text")
  leader: string;

  @Column("int")
  league: number;

  @Column("text")
  callNumber: string;

  @Column("text")
  members: string;

  @Column("int")
  score: number;

  @Column("int")
  games: number;

  @Column("int")
  wins: number;

  @Column("bool")
  survived: boolean;
}
