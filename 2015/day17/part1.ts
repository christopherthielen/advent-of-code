import { combine, range, readLines, toInt } from "../util";

const containers: number[] = readLines("input.txt").map(toInt);
const wins = range(0, containers.length).flatMap((count) => {
  return combine(containers, count).filter((list) => list.reduce((acc, x) => acc + x) === 150);
});

console.log(wins.length);
