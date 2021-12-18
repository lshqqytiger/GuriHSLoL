export class Team {
  id: number;
  name: string;
  leader: string;
  league: number;
  callNumber: string;
  members: string;
  score: number;
  games: number;
  wins: number;
  survived: boolean;

  constructor(
    name: string,
    leader: string,
    league: number,
    callNumber: string
  ) {
    this.name = name;
    this.leader = leader;
    this.league = league;
    this.callNumber = callNumber;
    this.members = JSON.stringify([]);
    this.score = 0;
    this.games = 0;
    this.wins = 0;
    this.survived = true;
  }
}
