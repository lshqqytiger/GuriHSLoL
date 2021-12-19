import { Client, MessageEmbed, MessageOptions } from "discord.js";
import typeorm, { createConnection } from "typeorm";
import { josa } from "josa";
import { Logger } from "./Logger";

import { TeamSchema } from "./entity/Team";
import { MatchSchema } from "./entity/Match";
import { Team } from "./model/Team";
import { Match } from "./model/Match";
import { Member } from "./Types";
import { Help } from "./String";

import config from "./Config";

const client = new Client();
const calculateScore = (tier: string, lane: string) => {
  switch (tier) {
    case "언랭":
    case "언랭크":
    case "아이언":
    case "브론즈":
      return lane == "미드" ? 1 : 0;
    case "실버":
      if (lane == "탑" || lane == "미드") return 3;
      else if (lane == "정글") return 4;
      else return 2;
    case "골드":
      if (lane == "탑") return 5;
      else if (lane == "정글") return 7;
      else if (lane == "미드") return 6;
      else if (lane == "원딜") return 4;
      else return 3;
    case "플래티넘":
    case "플레티넘":
      if (lane == "탑") return 7;
      else if (lane == "정글") return 8;
      else if (lane == "미드") return 9;
      else if (lane == "원딜") return 6;
      else return 5;
    case "다이아":
    case "다이아몬드":
      if (lane == "탑") return 10;
      else if (lane == "정글") return 11;
      else if (lane == "미드") return 10;
      else if (lane == "원딜") return 9;
      else return 7;
  }
};
const spreadMembers = (members: Member[]) => {
  let string = "";
  for (let i of members)
    string += `[${i.lane}] ${i.name}(${i.nickname}, ${
      i.tier
    }) [OP.GG](${encodeURI(
      `https://www.op.gg/summoner/userName=${i.nickname}`
    )}) [FOW.KR](${encodeURI(`http://fow.kr/find/${i.nickname}`)})\n`;
  return string || "팀원 등록되지 않음";
};

let agent: typeorm.Connection;
let teamRepository: typeorm.Repository<TeamSchema>;
let matchRepository: typeorm.Repository<MatchSchema>;

client.on("ready", async () => {
  agent = await createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "1234",
    database: "gurihslol",
    synchronize: true,
    logging: false,
    entities: [TeamSchema, MatchSchema],
  });
  teamRepository = agent.getRepository(TeamSchema);
  matchRepository = agent.getRepository(MatchSchema);
  Logger.log("ready");
});

client.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content.startsWith("!도움말")) {
    msg.channel.send({
      embed: new MessageEmbed().setTitle("도움말").addFields(Help),
    } as MessageOptions);
  } else if (msg.content.startsWith("!팀등록")) {
    const [name, leader, league, callNumber] = msg.content
      .substring(5)
      .split(",");
    if (!name || !leader || !callNumber || !league) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription("인자가 부족합니다."),
      } as MessageOptions);
      return;
    }
    const team = new Team(name, leader, Number(league), callNumber);
    await teamRepository.save(team);
    msg.channel.send(josa(`팀 ${name}#{이} 등록되었습니다.`));
  } else if (msg.content.startsWith("!팀원등록")) {
    const [teamName, name, studentId, tier, nickname, lane] = msg.content
      .substring(6)
      .split(",");
    if (!teamName || !name || !studentId || !tier || !nickname) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription("인자가 부족합니다."),
      } as MessageOptions);
      return;
    }
    const team = (await teamRepository.findOne({
      where: { name: teamName },
    })) as Team;
    if (!team) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription(josa(`팀 ${name}#{을} 찾을 수 없습니다.`)),
      } as MessageOptions);
      return;
    }
    const members: Member[] = JSON.parse(team.members);
    members.push({
      name,
      studentId,
      tier,
      nickname,
      lane,
    });
    team.score += calculateScore(tier, lane) || 0;
    team.members = JSON.stringify(members);
    await teamRepository.save(team);
    msg.channel.send(
      josa(`팀 ${teamName}에 팀원 ${name}#{이} 등록되었습니다.`)
    );
  } else if (
    msg.content.startsWith("!팀삭제") &&
    config.admin.includes(msg.author.id)
  ) {
    const name = msg.content.substring(5);
    if (!name) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription("인자가 부족합니다."),
      } as MessageOptions);
      return;
    }
    const team = (await teamRepository.findOne({
      where: { name },
    })) as Team;
    if (!team) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription(josa(`팀 ${name}#{을} 찾을 수 없습니다.`)),
      } as MessageOptions);
      return;
    }
    await teamRepository.remove(team);
    msg.channel.send(josa(`팀 ${name}#{이} 삭제되었습니다.`));
  } else if (msg.content.startsWith("!팀원삭제")) {
    const [teamName, name] = msg.content.substring(6).split(",");
    if (!teamName || !name) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription("인자가 부족합니다."),
      } as MessageOptions);
      return;
    }
    const team = (await teamRepository.findOne({
      where: { name: teamName },
    })) as Team;
    if (!team) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription(josa(`팀 ${teamName}#{을} 찾을 수 없습니다.`)),
      } as MessageOptions);
      return;
    }
    const members: Member[] = JSON.parse(team.members);
    const index = members.findIndex((i) => i.name === name);
    if (index === -1) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription(josa(`팀원 ${name}#{을} 찾을 수 없습니다.`)),
      } as MessageOptions);
      return;
    }
    members.splice(index, 1);
    team.score -= calculateScore(members[index].tier, members[index].lane) || 0;
    team.members = JSON.stringify(members);
    await teamRepository.save(team);
    msg.channel.send(
      josa(`팀 ${teamName}에서 팀원 ${name}#{이} 삭제되었습니다.`)
    );
  } else if (msg.content.startsWith("!팀목록")) {
    const league = Number(msg.content.substring(5));
    if (!league) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription("인자가 부족합니다."),
      } as MessageOptions);
      return;
    }
    const teams = (await teamRepository.find({
      where: { league },
    })) as Team[];
    const fields = [];
    for (let i of teams) {
      fields.push({
        name: i.name,
        value: `팀장: ${i.leader}\n${i.score}점\n${i.games}전 ${i.wins}승 ${
          i.games - i.wins
        }패`,
      });
    }
    msg.channel.send({
      embed: new MessageEmbed()
        .setTitle(`팀 목록 - ${league}학년`)
        .addFields(fields),
    } as MessageOptions);
  } else if (msg.content.startsWith("!팀정보")) {
    const name = msg.content.substring(5);
    if (!name) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription("인자가 부족합니다."),
      } as MessageOptions);
      return;
    }
    const team = (await teamRepository.findOne({
      where: { name },
    })) as Team;
    if (!team) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription(josa(`팀 ${name}#{을} 찾을 수 없습니다.`)),
      } as MessageOptions);
      return;
    }
    msg.channel.send({
      embed: new MessageEmbed().setTitle(`팀 정보 - ${team.name}`).addFields([
        {
          name: "참가 리그",
          value: `${team.league}학년`,
        },
        {
          name: "팀장",
          value: team.leader,
        },
        {
          name: "팀원",
          value: spreadMembers(JSON.parse(team.members)),
        },
        {
          name: "점수",
          value: team.score,
        },
        {
          name: "전적",
          value: `${team.games}전 ${team.wins}승 ${team.games - team.wins}패`,
        },
        {
          name: "탈락 여부",
          value: team.survived ? "생존" : "탈락",
        },
      ]),
    } as MessageOptions);
  } else if (msg.content.startsWith("!대진설정")) {
    const [round, team1Name, team1Score, team2Name, team2Score, isEnd] =
      msg.content.substring(6).split(",");
    if (!team1Name || !team1Score || !team2Name || !team2Score) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription("인자가 부족합니다."),
      } as MessageOptions);
      return;
    }
    const team1 = (await teamRepository.findOne({
      where: { name: team1Name },
    })) as Team;
    const team2 = (await teamRepository.findOne({
      where: { name: team2Name },
    })) as Team;
    if (!team1) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription(josa(`팀 ${team1Name}#{을} 찾을 수 없습니다.`)),
      } as MessageOptions);
      return;
    }
    if (!team2) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription(josa(`팀 ${team2Name}#{을} 찾을 수 없습니다.`)),
      } as MessageOptions);
      return;
    }
    const match =
      (await matchRepository.findOne({
        where: {
          round,
          team1: team1Name,
          team2: team2Name,
        },
      })) || new Match(Number(round), team1, team2);
    const winner = isEnd && (team1Score > team2Score ? team1 : team2).name;
    team1.games =
      team1.games -
      match.team1Score -
      match.team2Score +
      Number(team1Score) +
      Number(team2Score);
    team1.wins = team1.wins - match.team1Score + Number(team1Score);
    team2.games =
      team2.games -
      match.team1Score -
      match.team2Score +
      Number(team1Score) +
      Number(team2Score);
    team2.wins = team2.wins - match.team2Score + Number(team2Score);
    if (winner) {
      if (team1.name == winner) team2.survived = false;
      else team1.survived = false;

      match.winner = winner;
    }
    match.team1Score = Number(team1Score);
    match.team2Score = Number(team2Score);
    await teamRepository.save(team1);
    await teamRepository.save(team2);
    await matchRepository.save(match);
    msg.channel.send(
      josa(
        `팀 ${team1Name}#{과} 팀 ${team2Name} 간 ${round}강 대진이 설정되었습니다.${
          isEnd ? "\n" + winner + "#{이} 승리했습니다." : ""
        }`
      )
    );
  } else if (msg.content.startsWith("!대진정보")) {
    const [teamName, round] = msg.content.substring(6).split(",");
    if (!teamName) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription("인자가 부족합니다."),
      } as MessageOptions);
      return;
    }
    const match = (await matchRepository.find({
      where: [{ team1: teamName }, { team2: teamName }],
    })) as Match[];
    for (let i of match) {
      const team1 = (await teamRepository.findOne({
        where: { name: i.team1 },
      })) as Team;
      const team2 = (await teamRepository.findOne({
        where: { name: i.team2 },
      })) as Team;
      if (round ? i.round == Number(round) : true)
        msg.channel.send({
          embed: new MessageEmbed()
            .setTitle(`대진 정보 - ${i.team1} VS ${i.team2}`)
            .addFields([
              {
                name: "라운드 정보",
                value: `${i.round}강`,
              },
              {
                name: `${
                  i.winner
                    ? "[" + (i.winner == team1.name ? "승" : "패") + "] "
                    : ""
                }${team1.name} - ${i.team1Score}`,
                value: spreadMembers(JSON.parse(team1.members)),
              },
              {
                name: `${
                  i.winner
                    ? "[" + (i.winner == team2.name ? "승" : "패") + "] "
                    : ""
                }${team2.name} - ${i.team2Score}`,
                value: spreadMembers(JSON.parse(team2.members)),
              },
              {
                name: "상태",
                value: i.winner ? "종료" : "진행 중",
              },
              {
                name: "스코어",
                value: `${i.team1Score} : ${i.team2Score}`,
              },
            ]),
        } as MessageOptions);
    }
  } else if (
    msg.content.startsWith("!대진편성") &&
    config.admin.includes(msg.author.id)
  ) {
    const [league, round] = msg.content.substring(6).split(",");
    if (!league) {
      msg.channel.send({
        embed: new MessageEmbed()
          .setTitle("오류!")
          .setDescription("인자가 부족합니다."),
      } as MessageOptions);
      return;
    }
    const leftTeams = (await teamRepository.find({
      where: {
        league,
        survived: true,
      },
    })) as Team[];
    leftTeams.sort(() => Math.random() - 0.5);
    let winByDefaultValue = "";
    let string = "";
    if (leftTeams.length & (leftTeams.length - 1)) {
      const winByDefaultTeams: Team[] = [];
      while (leftTeams.length & (leftTeams.length - 1))
        winByDefaultTeams.push(leftTeams.pop() as Team);
      for (let i of winByDefaultTeams) {
        winByDefaultValue += `${i.name}(${i.score})\n`;
        if (round)
          await matchRepository.save(
            new Match(Number(round), i, new Team("부전승", "", i.league, ""))
          );
      }
    }
    for (let i = 0; i < leftTeams.length; i = i + 2) {
      let j = i + 1;
      string += `${leftTeams[i].name}(${leftTeams[i].score}) VS ${leftTeams[j].name}(${leftTeams[j].score})\n`;
      if (round)
        await matchRepository.save(
          new Match(Number(round), leftTeams[i], leftTeams[j])
        );
    }
    msg.channel.send({
      embed: new MessageEmbed()
        .setTitle(`대진 편성 결과${round ? "" : " (모의)"}`)
        .addFields([
          {
            name: "부전승",
            value: winByDefaultValue || "없음",
          },
          {
            name: "대진",
            value: string,
          },
        ]),
    } as MessageOptions);
  }
});

client.login(config.token);
