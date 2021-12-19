import { Team } from "../model/Team";

export class Match {
  id: number;
  round: number;
  team1: string;
  team2: string;
  team1Score: number;
  team2Score: number;
  winner?: string;

  constructor(round: number, team1: Team | string, team2: Team | string) {
    this.round = round;
    this.team1 = team1 instanceof Team ? team1.name : team1;
    this.team2 = team2 instanceof Team ? team2.name : team2;
    this.team1Score = 0;
    this.team2Score = 0;
  }
}
