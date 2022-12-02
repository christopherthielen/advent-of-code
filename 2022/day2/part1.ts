import { readLines } from "../util";

const lines = readLines("input.txt").map((line) => line.split(" "));
const SCORE_MOVES = { ROCK: 1, PAPER: 2, SCISSORS: 3 };
const SCORE_OUTCOMES = { LOSE: 0, DRAW: 3, WIN: 6 };

const PAPER = "PAPER";
const ROCK = "ROCK";
const SCISSORS = "SCISSORS";

type Turn = typeof PAPER | typeof ROCK | typeof SCISSORS;
const OpponentTurn = { A: ROCK, B: PAPER, C: SCISSORS };
const SelfTurn = { X: ROCK, Y: PAPER, Z: SCISSORS };

const turn = (opponent: string, self: string) => {
  const oTurn = OpponentTurn[opponent] as Turn;
  const sTurn = SelfTurn[self] as Turn;
  const winorlose = outcome(oTurn, sTurn);
  const choicebonus = SCORE_MOVES[sTurn];
  return winorlose + choicebonus;
};

const outcome = (opponent: Turn, self: Turn) => {
  if (opponent === self) {
    return SCORE_OUTCOMES.DRAW;
  } else if (opponent === "ROCK") {
    return self === "PAPER" ? SCORE_OUTCOMES.WIN : SCORE_OUTCOMES.LOSE;
  } else if (opponent === "PAPER") {
    return self === "SCISSORS" ? SCORE_OUTCOMES.WIN : SCORE_OUTCOMES.LOSE;
  } else if (opponent === "SCISSORS") {
    return self === "ROCK" ? SCORE_OUTCOMES.WIN : SCORE_OUTCOMES.LOSE;
  }
};

const total = lines.reduce((acc, [opponent, self]) => acc + turn(opponent, self), 0);
console.log(total);
