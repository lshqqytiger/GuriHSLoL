import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Team } from "../model/Team";

@Entity({ name: "match", schema: "public" })
export class MatchSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int")
  round: number;

  @Column("json")
  team1: Team;

  @Column("int")
  team1Score: number;

  @Column("json")
  team2: Team;

  @Column("int")
  team2Score: number;

  @Column({ type: "text", nullable: true })
  winner: string;
}
