import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Team } from "../model/Team";

@Entity({ name: "match", schema: "public" })
export class MatchSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int")
  round: number;

  @Column("text")
  team1: string;

  @Column("int")
  team1Score: number;

  @Column("text")
  team2: string;

  @Column("int")
  team2Score: number;

  @Column({ type: "text", nullable: true })
  winner: string;
}
