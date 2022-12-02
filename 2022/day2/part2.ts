import { readLines } from "../util";

const lines = readLines("input.txt").map((line) => line.split(" "));
const SCORE_MOVES = { ROCK: 1, PAPER: 2, SCISSORS: 3 };
const SCORE_OUTCOMES = { LOSE: 0, DRAW: 3, WIN: 6 };

const LOSE = "LOSE";
const DRAW = "DRAW";
const WIN = "WIN";

const PAPER = "PAPER";
const ROCK = "ROCK";
const SCISSORS = "SCISSORS";

type Turn = typeof PAPER | typeof ROCK | typeof SCISSORS;
const OpponentTurn = { A: ROCK, B: PAPER, C: SCISSORS };
const Outcome = { X: LOSE, Y: DRAW, Z: WIN };
const MyTurn = {
  SCISSORS: { WIN: ROCK, LOSE: PAPER, DRAW: SCISSORS },
  PAPER: { WIN: SCISSORS, LOSE: ROCK, DRAW: PAPER },
  ROCK: { WIN: PAPER, LOSE: SCISSORS, DRAW: ROCK },
};

const turn = (opponent: string, outcome: string) => {
  const opponentTurn = OpponentTurn[opponent] as Turn;
  const desiredOutcome = Outcome[outcome];
  const myTurn: Turn = MyTurn[opponentTurn][desiredOutcome];
  const outcomeScore = SCORE_OUTCOMES[desiredOutcome];
  const choiceScore = SCORE_MOVES[myTurn];
  return outcomeScore + choiceScore;
};

const total = lines.reduce((acc, [opponent, self]) => acc + turn(opponent, self), 0);
console.log(total);
