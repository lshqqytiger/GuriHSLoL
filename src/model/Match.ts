import { Team } from "../model/Team";

export class Match {
  id: number;
  round: number;
  team1: Team;
  team2: Team;
  team1Score: number;
  team2Score: number;
  winner?: string;

  constructor(round: number, team1: Team, team2: Team) {
    this.round = round;
    this.team1 = team1;
    this.team2 = team2;
    this.team1Score = 0;
    this.team2Score = 0;
  }
}
