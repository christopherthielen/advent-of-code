import * as fs from "fs";
import { range } from "lodash";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
// const inputPath = path.resolve(__dirname, "input.txt");
const positions = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x)
  .map((line) => /Player . starting position: (\d+)/.exec(line)[1])
  .map((pos) => parseInt(pos, 10) - 1);

const wins = [0, 0];
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
const resultCache: { [key: string]: Result } = {};
const cacheKey = (player: 1 | 0, p1pos: number, p2pos: number, p1score: number, p2score: number): string =>
  [player, p1pos, p2pos, p1score, p2score].join(",");

function playTurn(player: 1 | 0, p1pos: number, p2pos: number, p1score: number, p2score: number): Result {
  const key = cacheKey(player, p1pos, p2pos, p1score, p2score);
  const cachedResult = resultCache[key];
  if (cachedResult) {
    return cachedResult;
  }

  if (p1score >= WINNING_SCORE) {
    return [1, 0];
  } else if (p2score >= WINNING_SCORE) {
    return [0, 1];
  }

  const cumulativeResult = outcomes[player === 0 ? p1pos : p2pos].reduce(
    (acc, outcome) => {
      // prettier-ignore
      const result = player === 0 ?
        playTurn(1, outcome, p2pos, p1score + (outcome + 1), p2score) :
        playTurn(0, p1pos, outcome, p1score, p2score + (outcome + 1));

      return [acc[0] + result[0], acc[1] + result[1]] as Result;
    },
    [0, 0] as Result
  );

  resultCache[key] = cumulativeResult;
  return cumulativeResult;
}

console.log(playTurn(0, positions[0], positions[1], 0, 0));
console.log(wins);
