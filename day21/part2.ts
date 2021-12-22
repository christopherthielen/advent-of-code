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
const STATUS_POLL = 500;
const DIE_OUTCOMES = [1, 2, 3] as const;

let start = Date.now();
let ticks = Date.now();

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
  status();
  const key = cacheKey(player, p1pos, p2pos, p1score, p2score);
  const cachedResult = resultCache[key];
  if (cachedResult) {
    const [p1Wins, p2Wins] = cachedResult;
    wins[0] = wins[0] + p1Wins;
    wins[1] = wins[1] + p2Wins;
    return cachedResult;
  }

  if (p1score >= WINNING_SCORE) {
    wins[0]++;
    return [1, 0];
  } else if (p2score >= WINNING_SCORE) {
    wins[1]++;
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

function status(force = false) {
  if (force || Date.now() - ticks >= STATUS_POLL) {
    console.clear();
    const elapsedSecs = (Date.now() - start) / 1000;
    const expectedWins = [444356092776315, 341960390180808];
    const totalWins = wins[0] + wins[1];
    const percentComplete = totalWins / (expectedWins[0] + expectedWins[1]);
    const estimatedCompletion = elapsedSecs / percentComplete - elapsedSecs;
    ticks = Date.now();
    console.log({ elapsedSecs, wins, expectedWins, totalWins, percentComplete, estimatedCompletion });
  }
}

const results = playTurn(0, positions[0], positions[1], 0, 0);

status(true);
console.log({ results });
console.log("done");
console.log({ wins });
