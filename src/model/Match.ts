import { Team } from "./Team";

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
    this.team1 = typeof team1 == "string" ? team1 : team1.name;
    this.team2 = typeof team2 == "string" ? team2 : team2.name;
    this.team1Score = 0;
    this.team2Score = 0;
  }
}
