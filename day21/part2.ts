import * as fs from "fs";
import { memoize, range } from "lodash";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
// const inputPath = path.resolve(__dirname, "input.txt");
const positions = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x)
  .map((line) => /Player . starting position: (\d+)/.exec(line)[1])
  .map((pos) => parseInt(pos, 10) - 1);

const BOARD_SPACES = 10;
const WINNING_SCORE = 21;
const DIE_OUTCOMES = [1, 2, 3] as const;

// Roll, Roll, Roll your dice
const roll3 = (start: number): number[] => {
  const roll1 = (prevPosition: number) => DIE_OUTCOMES.map((outcome) => (prevPosition + outcome) % BOARD_SPACES);
  return roll1(start).map(roll1).flat().map(roll1).flat();
};
const outcomes = range(0, 10).map(roll3);

type P1Wins = number;
type P2Wins = number;
type Result = [P1Wins, P2Wins];
function playTurn(player: 1 | 0, p1pos: number, p2pos: number, p1score: number, p2score: number): Result {
  if (p1score >= WINNING_SCORE) {
    return [1, 0];
  } else if (p2score >= WINNING_SCORE) {
    return [0, 1];
  }

  return outcomes[player === 0 ? p1pos : p2pos].reduce(
    ([p1wins, p2wins], outcome) => {
      const [morep1wins, morep2wins] =
        player === 0
          ? play(1, outcome, p2pos, p1score + (outcome + 1), p2score)
          : play(0, p1pos, outcome, p1score, p2score + (outcome + 1));
      return [p1wins + morep1wins, p2wins + morep2wins] as Result;
    },
    [0, 0]
  );
}

const play = memoize(playTurn, (...args) => args.join());
console.log(play(0, positions[0], positions[1], 0, 0));
